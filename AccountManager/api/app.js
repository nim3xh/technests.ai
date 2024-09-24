const express = require("express");
const bodyParser = require('body-parser');
const app = express();

const usersRouter = require("./routes/users.route");
const accountDetailRouter = require("./routes/accountDetail.route");

app.use(bodyParser.json());
app.use("/users", usersRouter);
app.use("/accountDetails", accountDetailRouter);

module.exports = app;