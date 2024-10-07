const models = require("../models");
const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcrypt");
const validator = require("fastest-validator");
const v = new validator();

function save(req, res) {
  models.UserCredentials.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (user) {
        return res.status(409).json({
          message: "Email already exists",
        });
      } else {
        // Hash the password
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const UserCredentials = {
              email: req.body.email,
              password: hash,
              role: req.body.role,
            };

            // Validation schema
            const schema = {
              email: { type: "email", empty: false },
              password: { type: "string", empty: false },
              role: { type: "string", empty: false },
            };

            // Validate input
            const validationResponse = v.validate(UserCredentials, schema);
            if (validationResponse !== true) {
              return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse,
              });
            }

            // Create new user credentials
            models.UserCredentials.create(UserCredentials)
              .then((data) => {
                res.status(201).json({
                  message: "User created successfully",
                  user: data,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  message:
                    err.message ||
                    "Some error occurred while creating the UserCredentials.",
                });
              });
          }
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
}

function index(req, res) { 
    models.UserCredentials.findAll()
    .then((data) => {
        res.status(200).json(data);
    })
    .catch((err) => {
        res.status(500).json({
            message:
                err.message || "Some error occurred while retrieving UserCredentials.",
        });
    });
}

function changePassword(req, res) {
  // Check if required fields are provided
  if (!req.body.email || !req.body.oldPassword || !req.body.newPassword) {
    return res.status(400).json({
      message: "Email, old password, and new password are required",
    });
  }

  models.UserCredentials.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Compare old password with the stored hashed password
      bcrypt.compare(req.body.oldPassword, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Error comparing passwords",
            error: err,
          });
        }

        if (!result) {
          return res.status(401).json({
            message: "Old password is incorrect",
          });
        }

        // Hash the new password
        bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              message: "Error hashing the new password",
              error: err,
            });
          }

          // Update the password in the database
          user.password = hash;
          user
            .save()
            .then(() => {
              res.status(200).json({
                message: "Password changed successfully",
              });
            })
            .catch((saveError) => {
              res.status(500).json({
                message: "Error saving the new password",
                error: saveError,
              });
            });
        });
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    });
}


module.exports = {
    save: save,
    index: index,
    changePassword: changePassword,
};

