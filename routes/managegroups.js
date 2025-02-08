const express = require("express");
const router = express.Router();
const path = require("path");
const jwt = require("jsonwebtoken");
const db = require("../models/data");
require("dotenv").config();

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("userstoadd", async (data) => {
      let allUsers = await db.execute("SELECT * FROM users");
      let grpmembers = await db.execute(
        "SELECT * FROM `group_membrs` WHERE group_name = ?",
        [data.gusers]
      );
      let allUsersArr = allUsers[0].map((users) => users.name);
      let grpmembersArr = grpmembers[0].map((mem) => mem.user_name);
      const result = allUsersArr.filter(
        (element) => !grpmembersArr.includes(element)
      );

      socket.emit("userfetchedsuccessfully", {
        msg: "user fetched successfully",
        usersToAdd: result,
      });
    });

    socket.on("userstoremove", async (data) => {
      let grpmembers = await db.execute(
        "SELECT * FROM `group_membrs` WHERE group_name = ?",
        [data.gusers]
      );
      let membersArr = grpmembers[0].map((user) => user.user_name);
      socket.emit("usertoremsuccess", {
        msg: "user fetched",
        usersToRem: membersArr,
      });
    });

    socket.on("addusers", async (data) => {
      let cur_grp = data.addto;
      let userLi = data.usersLi;

      if (!Array.isArray(userLi) || userLi.length === 0) {
        socket.emit("invalidlist", { msg: "Invalid users list" });
      }

      try {
        await Promise.all(
          userLi.map((user) => {
            return db.execute(
              "INSERT INTO group_membrs (user_name, group_name) VALUES (?, ?)",
              [user, cur_grp]
            );
          })
        );

        socket.emit("usergrpinsertionsuccessfull", {
          msg: "Users inserted successfully",
        });
      } catch (err) {
        console.error(err);
        socket.emit("errorwhileinsertingindbgrpmembrs", {
          msg: "Something went wrong",
        });
      }
    });

    socket.on("remusers", async (data) => {
      let curr_grp = data.remfrm;
      let userLis = data.usersLiRem;

      if (!Array.isArray(userLis) || userLis.length === 0) {
        socket.emit("invalidlist", { msg: "Invalid users list" });
      }

      console.log(curr_grp, userLis);

      try {
        await Promise.all(
          userLis.map((user) => {
            return db.execute(
              "DELETE FROM group_membrs WHERE user_name = ? AND group_name = ?",
              [user, curr_grp]
            );
          })
        );

        socket.emit("userremsuccess", { msg: "Users removed successfully" });
      } catch (err) {
        console.error(err);
        socket.emit("errorwhileinsertingindbgrpmembrs", {
          msg: "Something went wrong",
        });
      }
    });

    socket.on("leaveusers", async (data) => {
      let curr_grp = data.levfrm;
      let userLis = data.userL;

      try {
        await db.execute(
          "DELETE FROM group_membrs WHERE user_name = ? AND group_name = ?",
          [userLis, curr_grp]
        );

        socket.emit("userleftsuccess", { msg: "user left successfully" });
      } catch (err) {
        console.log(err);
        socket.emit("errorwhileinsertingindbgrpmembrs", {
          msg: "Something went wrong",
        });
      }
    });

    socket.on("deletegrp", async (data) => {
      let dltGrp = data.dltgrp;

      try {
        await db.execute("DELETE FROM group_membrs WHERE group_name = ?", [
          dltGrp,
        ]);

        await db.execute("DELETE FROM user_groups WHERE group_name = ?", [
          dltGrp,
        ]);

        await db.execute(`DROP TABLE IF EXISTS \`${dltGrp}\``);

        console.log(`Table ${dltGrp} dropped successfully.`);

        socket.emit("grpdeletionsuccess", {
          msg: "group deleted successfully",
        });
      } catch (err) {
        socket.emit("errwhiledeletinggrp", { msg: "something went wrong" });
      }
    });
  });

  return router;
};
