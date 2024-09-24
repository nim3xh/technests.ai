const express = require("express");
const bodyParser = require('body-parser');
const app = express();

const usersRouter = require("./routes/users.route");

app.use(bodyParser.json());
app.use("/users", usersRouter);

module.exports = app;
