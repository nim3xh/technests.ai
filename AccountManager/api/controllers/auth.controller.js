const models = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { errorHandler } = require("../utils/error");
const validator = require("fastest-validator");
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

function signIn(req, res) {
    models.UserCredentials.findOne({
        where: {
            email: req.body.email
        }
    }).then((user) => {
        if (user) {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Authentication failed"
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        email: user.email,
                        userId: user.id
                    }, process.env.JWT_KEY, {
                        expiresIn: "1h"
                    });
                    return res.status(200).json({
                        message: "Authentication successful",
                        token: token
                    });
                }
                res.status(401).json({
                    message: "Authentication failed"
                });
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

module.exports = {
    signUp: signUp,
    signIn: signIn,
    changePassword: changePassword,
};