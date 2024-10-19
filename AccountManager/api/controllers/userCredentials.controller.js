const models = require("../models");
const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcrypt");
const validator = require("fastest-validator");
const v = new validator();

function save(req, res) {
  console.log("Request Body:", req.body);

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
              FirstName: req.body.firstName,
              LastName: req.body.lastName,
              ApexAccountNumber: req.body.apexAccountNumber,
              email: req.body.email,
              password: hash,
              role: req.body.role,
            };

            // Validation schema
            const schema = {
              FirstName: { type: "string", empty: false },
              LastName: { type: "string", empty: false },
              ApexAccountNumber: { type: "string", empty: true },
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
          err.message ||
          "Some error occurred while retrieving UserCredentials.",
      });
    });
}

function update(req, res) { 
  const id = req.params.id;
  const updatedUserCredentials = {
    FirstName: req.body.firstName,
    LastName: req.body.lastName,
    ApexAccountNumber: req.body.apexAccountNumber,
    email: req.body.email,
    role: req.body.role,
  };

  models.UserCredentials.update(updatedUserCredentials, { where: { id: id } })
    .then((num) => {
      if (num == 1) {
        res.status(200).json({
          message: "UserCredentials was updated successfully.",
        });
      } else {
        res.status(404).json({
          message: `Cannot update UserCredentials with id=${id}. Maybe UserCredentials was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error updating UserCredentials with id=" + id,
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

function updateUserByEmail(req, res) {
  const email = req.params.email;

  // Check if user exists
  models.UserCredentials.findOne({
    where: { email: email },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: `Cannot find UserCredentials with email=${email}.`,
        });
      }

      // Prepare fields for update
      const updatedFields = {
        FirstName: req.body.firstName || user.FirstName,
        LastName: req.body.lastName || user.LastName,
        ApexAccountNumber: req.body.apexAccountNumber || user.ApexAccountNumber,
        email: req.body.email || user.email,
        role: req.body.role || user.role,
      };

      // Validation schema
      const schema = {
        FirstName: { type: "string", empty: false },
        LastName: { type: "string", empty: false },
        ApexAccountNumber: { type: "string", empty: true },
        email: { type: "email", empty: false },
        role: { type: "string", empty: false },
      };

      // Validate input
      const validationResponse = v.validate(updatedFields, schema);
      if (validationResponse !== true) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validationResponse,
        });
      }

      // Check if password is being updated
      if (req.body.password) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          }

          updatedFields.password = hash;

          // Proceed with update
          performUpdate();
        });
      } else {
        // If no password update, proceed with the rest of the fields
        performUpdate();
      }

      // Function to update user credentials
      function performUpdate() {
        models.UserCredentials.update(updatedFields, {
          where: { email: email },
        })
          .then((num) => {
            if (num == 1) {
              res.status(200).json({
                message: "UserCredentials was updated successfully.",
              });
            } else {
              res.status(404).json({
                message: `Cannot update UserCredentials with email=${email}. Maybe UserCredentials was not found or req.body is empty!`,
              });
            }
          })
          .catch((err) => {
            res.status(500).json({
              message: "Error updating UserCredentials with email=" + email,
            });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({
        error: error.message || "An error occurred while retrieving user data.",
      });
    });
}

function destroy(req, res) {
  const id = req.params.id;

  models.UserCredentials.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.status(200).json({
          message: "UserCredentials was deleted successfully!",
        });
      } else {
        res.status(404).json({
          message: `Cannot delete UserCredentials with id=${id}. Maybe UserCredentials was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Could not delete UserCredentials with id=" + id,
      });
    });
}

module.exports = {
  save: save,
  index: index,
  changePassword: changePassword,
  updateUserByEmail: updateUserByEmail,
  destroy: destroy,
  update: update,
};
