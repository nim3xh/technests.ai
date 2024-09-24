const express = require("express");
const bodyParser = require('body-parser');
const app = express();

const usersRouter = require("./routes/users.route");

app.use(bodyParser.json());
app.use("/users", usersRouter);
app.use("/accountDetails", require("./routes/accountDetail.route"));

module.exports = app;
