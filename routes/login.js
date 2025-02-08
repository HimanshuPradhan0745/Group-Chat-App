const express = require("express");
const router = express.Router();
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("../models/data");
const generatedToken = require("../util/jwt");

module.exports = (io) => {
  router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "login.html"));
  });

  io.on("connection", (socket) => {
    socket.on("userlogincheck", (data) => {
      let userEmail = data.getEmail;
      let userPassword = data.getPassword;

      db.execute("SELECT*FROM users WHERE email=?", [userEmail])
        .then((resp) => {
          let dataFromDB = resp[0];

          if (dataFromDB.length == 0) {
            socket.emit("emailnotfound", { msg: "user email not found" });
          } else if (dataFromDB.length) {
            bcrypt.compare(
              userPassword,
              dataFromDB[0].password,
              (err, result) => {
                if (err) {
                  socket.emit("bcrypterror", { msg: "something went wrong" });
                  console.log("error");
                } else if (result == true) {
                  console.log("success");

                  socket.emit("userloginsuccessfull", {
                    msg: "user login successfull",
                    userId: generatedToken.encryptuserid(
                      dataFromDB[0].id,
                      dataFromDB[0].name
                    ),
                  });
                } else {
                  console.log("errormsg");
                  socket.emit("passwordincorrecterror", {
                    msg: "entered password is incorrect",
                  });
                }
              }
            );
          }
        })
        .catch((err) => {
          console.log(err);
          socket.emit("dberror", {
            msg: "db login error while checking credential",
          });
        });
    });
  });

  return router;
};
