const models = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { errorHandler } = require("../utils/error");
const validator = require("fastest-validator");
const { where } = require("sequelize");
const v = new validator();

dotenv.config();

function signUp(req, res) {
    models.UserCredentials.findOne({
        where: {
            email : req.body.email
        }
    }).then((user) => {
        if (user) {
            return res.status(409).json({
                message: "Email already exists"
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const user = {
                        email: req.body.email,
                        password: hash,
                        role: req.body.role
                    };
                    const schema = {
                        email: { type: "email", empty: false },
                        password: { type: "string", empty: false },
                        role: { type: "string", empty: false }
                    };
                    const validationResponse = v.validate(user, schema);
                    if (validationResponse !== true) {
                        return res.status(400).json({
                            message: "Validation failed",
                            errors: validationResponse
                        });
                    }
                    models.UserCredentials.create(user)
                        .then((result) => {
                            res.status(201).json({
                                message: "User created successfully",
                                user: result
                            });
                        })
                        .catch((error) => {
                            res.status(500).json({
                                error: error
                            });
                        });
                }
            });
        }
    }).catch((error) => {
        res.status(500).json({
            error: error
        });
    });
}


function bulkSignUp(req, res) {
    const users = req.body.users; // Expecting an array of user objects {email, password, role}
    if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({
            message: "Invalid input: users array is required"
        });
    }

    const schema = {
        email: { type: "email", empty: false },
        password: { type: "string", empty: false },
        role: { type: "string", empty: false }
    };

    // Validate all users
    const validationErrors = [];
    const validatedUsers = users.map((user, index) => {
        const validationResponse = v.validate(user, schema);
        if (validationResponse !== true) {
            validationErrors.push({ index, errors: validationResponse });
        }
        return user;
    });

    if (validationErrors.length > 0) {
        return res.status(400).json({
            message: "Validation failed for one or more users",
            errors: validationErrors
        });
    }

    // Check if any of the emails already exist
    const emails = users.map(user => user.email);
    models.UserCredentials.findAll({
        where: {
            email: emails
        }
    }).then(existingUsers => {
        const existingEmails = existingUsers.map(user => user.email);
        const duplicates = users.filter(user => existingEmails.includes(user.email));
        if (duplicates.length > 0) {
            return res.status(409).json({
                message: "Some emails already exist",
                duplicates: duplicates.map(user => user.email)
            });
        }

        // Hash passwords and create users
        const hashPromises = users.map(user =>
            bcrypt.hash(user.password, 10).then(hash => ({
                ...user,
                password: hash
            }))
        );

        Promise.all(hashPromises)
            .then(hashedUsers => {
                models.UserCredentials.bulkCreate(hashedUsers)
                    .then(result => {
                        res.status(201).json({
                            message: "Users created successfully",
                            users: result
                        });
                    })
                    .catch(error => {
                        res.status(500).json({
                            error: error
                        });
                    });
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
    }).catch(error => {
        res.status(500).json({
            error: error
        });
    });
}


function signIn(req, res) {
  models.UserCredentials.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (user === null) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      } else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (result) {
            const token = jwt.sign(
              {
                email: user.email,
                userId: user.id,
                role: user.role,
              },
              process.env.JWT_SECRET_KEY,
              {
                expiresIn: "1h",
              }
            );

            const { password: pass, ...rest } = user.dataValues;

            res
              .status(200)
              .cookie("access_token", token, {
                httpOnly: true, // This is secure, as it cannot be accessed via JavaScript
                maxAge: 86400000, // Cookie expires in 1 day
              })
              .json({
                success: true,
                token, // Including the token in the response
                user: rest, // Sending user details excluding the password
              });
          } else {
            return res.status(400).json({
              success: false,
              message: "Invalid Password",
            });
          }
        });
      }
    })
    .catch((error) => {
      // You may want to handle the error here as well
      res
        .status(500)
        .json({ success: false, message: "Internal server error", error });
    });
}


function changePassword(req, res) {
    var { email, oldPassword, newPassword } = req.body;
    
    const schema = {
        email: { type: "email", empty: false },
        oldPassword: { type: "string", empty: false },
        newPassword: { type: "string", empty: false }
    };

    const validationResponse = v.validate(req.body, schema);
    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            errors: validationResponse
        });
    }

    models.UserCredentials.findOne({
        where: {
            email: email
        }
    }).then((user) => {
        if (user) {
            bcrypt.compare(oldPassword, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Authentication failed"
                    });
                }
                if (result) {
                    bcrypt.hash(newPassword, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            });
                        }
                        user.password = hash;
                        user.save().then((result) => {
                            res.status(200).json({
                                message: "Password changed successfully",
                                user: result
                            });
                        }).catch((error) => {
                            res.status(500).json({
                                error: error
                            });
                        });
                    });
                } else {
                    res.status(401).json({
                        message: "Authentication failed"
                    });
                }
            });
        } else {
            res.status(401).json({
                message: "Authentication failed"
            });
        }
    }).catch((error) => {
        res.status(500).json({
            error: error
        });
    });
}

function signout(req, res) {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json({ success: true, message: "User signed out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error: error });
  }
}

module.exports = {
    signUp: signUp,
    signIn: signIn,
    changePassword: changePassword,
    signout: signout,
    bulkSignUp: bulkSignUp
};