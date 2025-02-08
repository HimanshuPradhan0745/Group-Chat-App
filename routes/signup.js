const express = require("express");
const router = express.Router();
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("../models/data");

module.exports = (io) => {
  router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "signup.html"));
  });

  io.on("connection", (socket) => {
    socket.on("insertnewuser", (data) => {
      let userName = data.uName;
      let userEmail = data.uEmail;
      let userPhone = data.uPhone;
      let userPassword = data.uPassword;

      bcrypt.hash(userPassword, 10, (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          db.execute(
            "INSERT INTO users (name,email,phone,password) VALUES(?,?,?,?)",
            [userName, userEmail, userPhone, hash]
          )
            .then((resp) => {
              socket.emit("successfulinsertion", {
                msg: "user successfully inserted",
              });
            })
            .catch((err) => {
              console.log(err);
              if (err.code == "ER_DUP_ENTRY") {
                socket.emit("duplicateuser", { msg: "user already exists" });
              } else {
                socket.emit("error", {
                  msg: "something went wrong while inserting new user",
                });
              }
            });
        }
      });
    });
  });

  return router;
};
