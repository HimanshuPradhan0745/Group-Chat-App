const express = require("express");
const router = express.Router();
const path = require("path");
const jwt = require("jsonwebtoken");
const db = require("../models/data");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("createnewgroup", async (data) => {
      try {
        let userDet = data.jwtToken;
        let user = jwt.verify(userDet, process.env.JWT_TOKEN_SECRET);

        const resp = await db.execute(
          "INSERT INTO `user_groups` (group_name, created_by) VALUES(?, ?)",
          [data.getGrpName, user.userId]
        );

        const createTableQuery = `
                    CREATE TABLE ${db.escapeId(data.getGrpName)} (
                        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                        user_id INT NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        message VARCHAR(255) DEFAULT NULL,
                        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (id)
                    )`;
        await db.execute(createTableQuery);

        await db.execute(
          `INSERT INTO ${db.escapeId(
            data.getGrpName
          )} (user_id, name, message) VALUES(?, ?, 'Created this group')`,
          [user.userId, user.userName]
        );

        const groupResult = await db.execute(
          "SELECT * FROM `user_groups` WHERE group_name = ?",
          [data.getGrpName]
        );
        const groupName = groupResult[0][0].group_name;

        for (const member of data.selectedMembers) {
          await db.execute(
            "INSERT INTO `group_membrs` (user_name, group_name) VALUES(?, ?)",
            [member, groupName]
          );
        }

        socket.emit("groupcreatedsuccessfully", {
          msg: "New group created successfully",
          grpName: data.getGrpName,
        });
      } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
          socket.emit("groupalreadyexist", { msg: "Duplicate entry" });
        }
        socket.emit("somethingwentwrongwhilecreatinggroup", {
          msg: "Something went wrong",
        });
      }
    });
  });

  return router;
};
