const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../models/data");
require("dotenv").config();

module.exports = (io) => {
  
  const verifyToken = (token) => {
    try {
      return jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    } catch (err) {
      console.error("JWT verification failed:", err);
      return null;
    }
  };

  io.on("connection", (socket) => {
    console.log("A user connected");

    
    socket.on("chatmessagesgetmessages", (data) => {
      const { reqgrp, jwtToken } = data;

      if (!reqgrp || !jwtToken) {
        socket.emit("erroringettingmsg", { msg: "Invalid data provided" });
        return;
      }

      const user = verifyToken(jwtToken);
      if (!user) {
        socket.emit("erroringettingmsg", { msg: "Invalid JWT token" });
        return;
      }

      console.log("User details:", user);

      db.execute(`SELECT * FROM ${db.escapeId(reqgrp)}`)
        .then((resp) => {
          socket.emit("messagesgotfromDB", {
            msg: "Data fetched successfully",
            Msgdata: resp[0],
            user: user.userId,
            uName: user.userName,
          });
        })
        .catch((err) => {
          console.error("Error fetching messages:", err);
          socket.emit("erroringettingmsg", { msg: "Error fetching messages" });
        });
    });

    
    socket.on("getgroupslist", async (data) => {
      const { jwtToken } = data;

      if (!jwtToken) {
        socket.emit("errorwhilefetchinggrpslist", { msg: "Invalid token" });
        return;
      }

      const user = verifyToken(jwtToken);
      if (!user || !user.userId) {
        socket.emit("errorwhilefetchinggrpslist", { msg: "Invalid user data" });
        return;
      }

      try {
        const groupsCreated = await db.execute(
          "SELECT * FROM user_groups WHERE created_by = ?",
          [user.userId]
        );
        socket.emit("usergrpsfetchsuccess", {
          groups_created: groupsCreated[0],
        });
      } catch (err) {
        console.error("Error fetching groups list:", err);
        socket.emit("errorwhilefetchinggrpslist", {
          msg: "Error fetching groups",
        });
      }
    });

    
    socket.on("getusers", (data) => {
      const { jwtToken } = data;

      if (!jwtToken) {
        socket.emit("errowhilefetchusers", { msg: "Invalid token" });
        return;
      }

      const user = verifyToken(jwtToken);
      if (!user || !user.userName) {
        socket.emit("errowhilefetchusers", { msg: "Invalid user data" });
        return;
      }

      db.execute("SELECT name FROM users WHERE name != ?", [user.userName])
        .then((resp) => {
          socket.emit("userslistfetchsuccess", {
            msg: "User fetched successfully",
            Userdata: resp[0],
          });
        })
        .catch((err) => {
          console.error("Error fetching users:", err);
          socket.emit("errowhilefetchusers", {
            msg: "Error fetching users",
          });
        });
    });

    
    socket.on("groupsin", (data) => {
      const { jwtToken } = data;

      if (!jwtToken) {
        socket.emit("errorwhilefetchusersgrps", { msg: "Invalid token" });
        return;
      }

      const user = verifyToken(jwtToken);
      if (!user || !user.userName) {
        socket.emit("errorwhilefetchusersgrps", { msg: "Invalid user data" });
        return;
      }

      db.execute("SELECT * FROM group_membrs WHERE user_name = ?", [
        user.userName,
      ])
        .then((resp) => {
          socket.emit("usermemberin", { grpdata: resp[0] });
        })
        .catch((err) => {
          console.error("Error fetching user groups:", err);
          socket.emit("errorwhilefetchusersgrps", {
            msg: "Error fetching groups",
          });
        });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  return router;
};

