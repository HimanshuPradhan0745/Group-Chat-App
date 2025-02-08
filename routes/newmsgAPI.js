const express = require("express");
const router = express.Router();
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../models/data");
require("dotenv").config();

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("getlatestmsg", (data) => {
      let userDet = data.jwtToken;

      let user = jwt.verify(userDet, process.env.JWT_TOKEN_SECRET);

      let reqgrp = data.reqgrp;

      console.log(reqgrp);
      db.execute(`SELECT * FROM ${db.escapeId(reqgrp)}`)
        .then((resp) => {
          socket.emit("latestmsgfetchsuccess", {
            latestdata: resp[0],
            id: user.userId,
            name: user.userName,
          });
        })
        .catch((err) => {
          console.log(err);
          socket.emit("latestmsgfetchfailure", {
            msg: "latest msg fetch failure",
          });
        });
    });
  });

  return router;
};
