const socket = io("http://localhost:7878");

socket.on("connect", () => {
  console.log("Connected to the server");
});
let userDetails = JSON.parse(localStorage.getItem("userId")).toString();

let showTexts = document.getElementById("chat-texts");
const sendBtn = document.getElementById("send-btn");
let create_form = document.getElementById("create-group-form");
let membersList = document.getElementById("members");
let add_User_grp = document.getElementById("add-user");
let remove_User_grp = document.getElementById("remove-user");
let delete_grp = document.getElementById("delete-group");
let cancel_au = document.getElementById("cancel-btn-au");
let cancel_ru = document.getElementById("cancel-btn-ru");

/* Page when loads */

window.onload = () => {
  getEveryMsg();
  socket.emit("getgroupslist", { jwtToken: userDetails.toString() });
  socket.emit("groupsin", { jwtToken: userDetails });
};

function getEveryMsg() {
  if (localStorage.getItem("reqgrp") == undefined) {
    localStorage.setItem("reqgrp", "messages");
    reqgrp = "messages";
  } else {
    reqgrp = localStorage.getItem("reqgrp");
  }

  showTexts.innerHTML = "";

  socket.emit("chatmessagesgetmessages", {
    reqgrp: reqgrp,
    jwtToken: userDetails,
  });
}

socket.on("usermemberin", (data) => {
  showGroups(data);

  let crnt_grp = localStorage.getItem("reqgrp");
  let userMemArr = data.grpdata.map((list) => list.group_name);
  console.log(userMemArr);
  if (userMemArr.indexOf(crnt_grp) == -1) {
    localStorage.setItem("reqgrp", "messages");
  }
});

socket.on("errorwhilefetchusersgrps", (data) => {
  console.log("error while fetching details of users");
});

socket.on("messagesgotfromDB", (data) => {
  console.log(data);
  localStorage.setItem("dataFromDB", JSON.stringify(data));

  fetchData();
});

socket.on("erroringettingmsg", (data) => {
  console.log("error while getting messages from db");
});

add_User_grp.addEventListener("click", () => {
  let addUsersEle = document.getElementById("add-members-to-group");
  addUsersEle.innerHTML = "";
  document.getElementById("add-user-to-group-form").style.display = "flex";
  let groups_users = localStorage.getItem("reqgrp");

  socket.emit("userstoadd", { gusers: groups_users });
});

remove_User_grp.addEventListener("click", () => {
  let remUsersEle = document.getElementById("remove-members-from-group");
  remUsersEle.innerHTML = "";

  document.getElementById("remove-user-from-group-form").style.display = "flex";
  let groups_users = localStorage.getItem("reqgrp");
  socket.emit("userstoremove", { gusers: groups_users });
});

delete_grp.addEventListener("click", () => {
  let confirmToDelete = confirm("Are you sure to delete this group?");

  if (confirmToDelete) {
    let currentGrp = localStorage.getItem("reqgrp");

    socket.emit("deletegrp", { dltgrp: currentGrp });
  }
});

socket.on("userfetchedsuccessfully", (data) => {
  let addUsersEle = document.getElementById("add-members-to-group");
  if (data.usersToAdd.length) {
    for (let i = 0; i < data.usersToAdd.length; i++) {
      let newLabelfu = document.createElement("label");
      newLabelfu.innerHTML = `<input type="checkbox" value="${data.usersToAdd[i]}"> ${data.usersToAdd[i]}`;
      addUsersEle.appendChild(newLabelfu);
    }
  } else {
    let alreadyPresent = document.createElement("h3");
    alreadyPresent.innerText = "No users to add";
    alreadyPresent.style.color = "whitesmoke";
    addUsersEle.appendChild(alreadyPresent);
  }
});

socket.on("usertoremsuccess", (data) => {
  let remUsersEle = document.getElementById("remove-members-from-group");
  let groups_users = localStorage.getItem("reqgrp");
  let createdGrp = localStorage.getItem("groupsCreated");
  let userH = JSON.parse(localStorage.getItem("dataFromDB")).uName;
  console.log(userH);
  if (data.usersToRem.length) {
    for (let i = 0; i < data.usersToRem.length; i++) {
      if (
        createdGrp.indexOf(groups_users) !== -1 &&
        data.usersToRem[i] == userH
      ) {
        continue;
      }
      let newLabelfu = document.createElement("label");
      newLabelfu.innerHTML = `<input type="checkbox" value="${data.usersToRem[i]}"> ${data.usersToRem[i]}`;
      remUsersEle.appendChild(newLabelfu);
    }
  } else {
    let alreadyRem = document.createElement("h3");
    alreadyRem.innerText = "All users were removed";
    alreadyRem.style.color = "whitesmoke";
    remUsersEle.appendChild(alreadyRem);
  }
});

socket.on("grpdeletionsuccess", (data) => {
  localStorage.setItem("reqgrp", "messages");
  getEveryMsg();
  socket.emit("groupsin", { jwtToken: userDetails });

  if (localStorage.getItem("reqgrp") == "messages") {
    document.getElementById("leave-frm-grp").style.display = "none";
  } else if (localStorage.getItem("reqgrp") !== "messages") {
    document.getElementById("leave-frm-grp").style.display = "flex";
  }

  document.getElementById("manage-group").style.display = "none";
});

socket.on("errwhiledeletinggrp", (data) => {
  console.log("error while deleting the group");
});

cancel_au.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("add-user-to-group-form").style.display = "none";
});

cancel_ru.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("remove-user-from-group-form").style.display = "none";
});

document
  .getElementById("add-user-to-group-form")
  .addEventListener("submit", async (e) => {
    const checkedUsers = document.querySelectorAll(
      '#add-members-to-group input[type="checkbox"]:checked'
    );
    const selectedUsers = Array.from(checkedUsers).map(
      (checkbox) => checkbox.value
    );
    let currentGrp = localStorage.getItem("reqgrp");

    e.preventDefault();
    socket.emit("addusers", { addto: currentGrp, usersLi: selectedUsers });

    document.getElementById("add-user-to-group-form").style.display = "none";
  });

socket.on("invalidlist", (data) => {
  console.log("users list is invalid");
});

socket.on("usergrpinsertionsuccessfull", (data) => {
  console.log("user insertion succesful to grpmembrs");
});

socket.on("errorwhileinsertingindbgrpmembrs", (data) => {
  console.log("error while inserting users to grpmembers");
});

document
  .getElementById("remove-user-from-group-form")
  .addEventListener("submit", (e) => {
    const checkedUsersRem = document.querySelectorAll(
      '#remove-members-from-group input[type="checkbox"]:checked'
    );
    const selectedUsersRem = Array.from(checkedUsersRem).map(
      (checkbox) => checkbox.value
    );
    let currentGrp = localStorage.getItem("reqgrp");

    e.preventDefault();

    socket.emit("remusers", {
      remfrm: currentGrp,
      usersLiRem: selectedUsersRem,
    });

    document.getElementById("remove-user-from-group-form").style.display =
      "none";
  });

socket.on("userremsuccess", (data) => {
  console.log("users rem from group");
});

document.getElementById("leave-frm-grp").addEventListener("click", () => {
  let currentGrpL = localStorage.getItem("reqgrp");
  let userL = JSON.parse(localStorage.getItem("dataFromDB"));
  let userLeave = userL.uName;
  socket.emit("leaveusers", { levfrm: currentGrpL, userL: userLeave });
});

socket.on("userleftsuccess", (data) => {
  localStorage.setItem("reqgrp", "messages");

  if (localStorage.getItem("reqgrp") == "messages") {
    document.getElementById("leave-frm-grp").style.display = "none";
  } else if (localStorage.getItem("reqgrp") !== "messages") {
    document.getElementById("leave-frm-grp").style.display = "flex";
  }

  document.getElementById("manage-group").style.display = "none";

  socket.emit("groupsin", { jwtToken: userDetails });
  getEveryMsg();
});

function getusersList() {
  membersList.innerHTML = "";

  socket.emit("getusers", { jwtToken: userDetails });
}

socket.on("userslistfetchsuccess", (data) => {
  console.log(data);
  for (let i = 0; i < data.Userdata.length; i++) {
    let newLabel = document.createElement("label");
    newLabel.innerHTML = `<input type="checkbox" value="${data.Userdata[i].name}"> ${data.Userdata[i].name}`;
    membersList.appendChild(newLabel);
  }
});

socket.on("errowhilefetchusers", (data) => {
  console.log("error while fetching users");
});

function getGroups() {
  socket.emit("getgroupslist", { jwtToken: userDetails.toString() });
}

socket.on("usergrpsfetchsuccess", (data) => {
  let groupsArr = data.groups_created.map((group) => group.group_name);

  localStorage.setItem("groupsCreated", JSON.stringify(groupsArr));

  let crnt_grp = localStorage.getItem("reqgrp");

  if (groupsArr.indexOf(crnt_grp) !== -1) {
    document.getElementById("manage-group").style.display = "flex";
    document.getElementById("leave-frm-grp").style.display = "none";
  }

  if (groupsArr.indexOf(crnt_grp) == -1) {
    if (localStorage.getItem("reqgrp") == "messages") {
      document.getElementById("leave-frm-grp").style.display = "none";
    } else if (localStorage.getItem("reqgrp") !== "messages") {
      document.getElementById("leave-frm-grp").style.display = "flex";
    }

    document.getElementById("manage-group").style.display = "none";
  }
});

socket.on("errorwhilefetchinggrpslist", (data) => {
  console.log("error while fetching groups list");
});

create_form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let getGrpName = document.getElementById("group-name").value;

  const checkedCheckboxes = document.querySelectorAll(
    '#members input[type="checkbox"]:checked'
  );
  const selectedMembers = Array.from(checkedCheckboxes).map(
    (checkbox) => checkbox.value
  );
  selectedMembers.push(JSON.parse(localStorage.getItem("dataFromDB")).uName);

  document
    .querySelectorAll('#members input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });
  document.getElementById("group-name").value = "";

  socket.emit("createnewgroup", {
    getGrpName,
    selectedMembers,
    jwtToken: userDetails.toString(),
  });
});

socket.on("groupcreatedsuccessfully", (data) => {
  document.getElementById("create-group-form").style.display = "none";

  localStorage.setItem("reqgrp", data.grpName);
  socket.emit("groupsin", { jwtToken: userDetails });
  socket.emit("getgroupslist", { jwtToken: userDetails.toString() });
  getEveryMsg();
});

socket.on("groupalreadyexist", (data) => {
  let duplicate_grp = document.getElementById("duplicate-msg");
  duplicate_grp.style.display = "block";

  setTimeout(() => {
    duplicate_grp.style.display = "none";
  }, 2000);
});

socket.on("somethingwentwrongwhilecreatinggroup", (data) => {
  console.log("somethingwentwrongwhilecreatinggroup");
});

document.getElementById("crt-grp-btn").addEventListener("click", function () {
  document.getElementById("create-group-form").style.display = "flex";
  getusersList();
});

document.getElementById("cancel-btn").addEventListener("click", function () {
  document.getElementById("create-group-form").style.display = "none";
  document
    .querySelectorAll('#members input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });
  document.getElementById("group-name").value = "";
});

socket.on("latestmsgfetchsuccess", (data) => {
  let dataFromLocal = JSON.parse(localStorage.getItem("dataFromDB"));
  dataFromLocal.user = data.id;
  dataFromLocal.uName = data.name;

  dataFromLocal.Msgdata = data.latestdata;
  localStorage.setItem("dataFromDB", JSON.stringify(dataFromLocal));

  fetchData();
});

socket.on("latestmsgfetchfailure", (data) => {
  console.log("failedtofetchlatest msg", data);
});

let btn_check = false;

function showGroups(groups) {
  if (btn_check) {
    document
      .getElementById("messages")
      .removeEventListener("click", handleClickGroup);
    const buttonClass = "grp-btn";
    const buttons = document.querySelectorAll(`.${buttonClass}`);
    buttons.forEach((button) => {
      button.removeEventListener("click", handleClickGroup);
    });
  }

  let group_head = document.getElementById("grp-lists-show");
  group_head.innerHTML = "";
  let global_btn = document.createElement("button");
  global_btn.type = "button";
  global_btn.innerText = "Global room";
  global_btn.className = "grp-btn";
  global_btn.id = "messages";
  global_btn.addEventListener("click", handleClickGroup);
  group_head.appendChild(global_btn);

  //console.log(groups.data)
  for (let i = 0; i < groups.grpdata.length; i++) {
    let grp_btn = document.createElement("button");
    grp_btn.type = "button";
    grp_btn.innerText = groups.grpdata[i].group_name;
    grp_btn.className = "grp-btn";
    grp_btn.id = `${groups.grpdata[i].group_name}`;
    grp_btn.addEventListener("click", handleClickGroup);

    group_head.appendChild(grp_btn);
    //console.log(a)
  }
  btn_check = true;

  socket.emit("chatmessagesgetmessages", {
    reqgrp: reqgrp,
    jwtToken: userDetails,
  });
}

function handleClickGroup(e) {
  localStorage.setItem("reqgrp", e.target.id);

  let groups_C = JSON.parse(localStorage.getItem("groupsCreated"));

  if (groups_C.indexOf(e.target.id) !== -1) {
    document.getElementById("manage-group").style.display = "flex";
  } else {
    document.getElementById("manage-group").style.display = "none";
  }

  let crnt_rq = localStorage.getItem("reqgrp");
  socket.emit("getlatestmsg", {
    jwtToken: userDetails.toString(),
    reqgrp: crnt_rq,
  });
  socket.emit("getgroupslist", { jwtToken: userDetails.toString() });
}

// function fetchData() {
//   let welcomeUser = document.getElementById("userWelcome");
//   let grpName = document.getElementById("show-grp-name");
//   let grpNameLS = localStorage.getItem("reqgrp");
//   let getFromLocalst = localStorage.getItem("dataFromDB");
//   let dataFromLocal = JSON.parse(getFromLocalst);
//   grpName.innerText = `Group Name :  ${
//     grpNameLS == "messages" ? "Global" : grpNameLS
//   }`;
//   welcomeUser.innerText = ` Welcome ${dataFromLocal.uName}`;
//   let data = dataFromLocal.Msgdata;
//   showTexts.innerHTML = "";

//   for (let i = 0; i < data.length; i++) {
//     let messageContainer = document.createElement("div");
//     messageContainer.style.display = "flex";
//     messageContainer.style.justifyContent =
//       data[i].user_id === dataFromLocal.user ? "flex-end" : "flex-start";
//     messageContainer.style.margin = "5px 0"; // Adjust margin as needed
//     let p = document.createElement("p");

//     p.style.padding = "10px";
//     p.style.borderRadius = "8px";
//     p.style.margin = "5px 0";
//     p.style.fontSize = "1.4rem";
//     p.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
//     p.style.transition = "background-color 0.3s ease";
//     p.style.transition = "background-color 0.3s ease";

//     p.style.backgroundColor =
//       data[i].user_id === dataFromLocal.user ? "#f9f9f9" : "#eaeaea";

//     let userName = document.createElement("span");
//     userName.innerText =
//       data[i].user_id === dataFromLocal.user ? `you` : data[i].name;
//     userName.style.fontWeight =
//       data[i].user_id === dataFromLocal.user ? "bold" : "normal";
//     userName.style.color = "#555";

//     let userMsg = document.createElement("span");
//     userMsg.innerText = data[i].message;
//     userMsg.style.color = "#333";

//     let msgDate = document.createElement("span");
//     let dateFormat = new Date(data[i].created_date);
//     msgDate.innerText = dateFormat.toLocaleString("en-US", {
//       month: "2-digit",
//       day: "2-digit",
//       hour: "numeric",
//       minute: "numeric",
//       hour12: true,
//     });
//     msgDate.style.fontSize = "0.8rem";
//     msgDate.style.display = "block";

//     p.appendChild(userName);
//     p.appendChild(document.createTextNode(" : "));
//     p.appendChild(userMsg);
//     p.appendChild(msgDate);

//     messageContainer.appendChild(p);

//     showTexts.appendChild(messageContainer);
//   }

//   scrollToBottom();
// }





function fetchData() {
  let welcomeUser = document.getElementById("userWelcome");
  let grpName = document.getElementById("show-grp-name");
  let grpNameLS = localStorage.getItem("reqgrp");
  let getFromLocalst = localStorage.getItem("dataFromDB");
  let dataFromLocal = JSON.parse(getFromLocalst);
  grpName.innerText = `Group Name :  ${grpNameLS === "messages" ? "Global" : grpNameLS}`;
  welcomeUser.innerText = ` Welcome ${dataFromLocal.uName}`;
  let data = dataFromLocal.Msgdata;
  showTexts.innerHTML = ""; 

  for (let i = 0; i < data.length; i++) {
    let messageContainer = document.createElement("div");
    messageContainer.style.display = "flex";
    messageContainer.style.justifyContent = data[i].user_id === dataFromLocal.user ? "flex-end" : "flex-start";
    messageContainer.style.margin = "5px 0";

    let p = document.createElement("p");
    p.style.padding = "10px";
    p.style.borderRadius = "8px";
    p.style.margin = "5px 0";
    p.style.fontSize = "1.4rem";
    p.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    p.style.transition = "background-color 0.3s ease";
    p.style.backgroundColor = data[i].user_id === dataFromLocal.user ? "#f9f9f9" : "#eaeaea";

    let userName = document.createElement("span");
    userName.innerText = data[i].user_id === dataFromLocal.user ? `You` : data[i].name;
    userName.style.fontWeight = data[i].user_id === dataFromLocal.user ? "bold" : "normal";
    userName.style.color = "#555";

    let userMsg = document.createElement("span");
    userMsg.innerText = data[i].message;
    userMsg.style.color = "#333";

    let msgDate = document.createElement("span");
    let createdDate = data[i].created_date;  
    console.log("Message Data:", data[i]);  
    
    let dateFormat;
    if (createdDate) {
      dateFormat = new Date(createdDate);
    } else {
      dateFormat = new Date(); 
    }

    
    if (dateFormat.getTime() && !isNaN(dateFormat.getTime())) {
      msgDate.innerText = dateFormat.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      msgDate.style.fontSize = "0.8rem";
      msgDate.style.display = "block";
      msgDate.style.color = "#888";
    } else {
      console.log("Invalid Date");  
      msgDate.innerText = "Invalid Date";  
    }

    p.appendChild(userName);
    p.appendChild(document.createTextNode(" : "));
    p.appendChild(userMsg);
    p.appendChild(msgDate);  

    messageContainer.appendChild(p);
    showTexts.appendChild(messageContainer);
  }

  scrollToBottom();  
}


function scrollToBottom() {
  const showTexts = document.getElementById("showTexts");
  showTexts.scrollTop = showTexts.scrollHeight;
}

function scrollToBottom() {
  showTexts.scrollTop = showTexts.scrollHeight;
}

sendBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let insert_grp = localStorage.getItem("reqgrp");

  let textVal = document.getElementById("texts").value;

  socket.emit("insertmsgtogrp", {
    msg: textVal,
    insertgrp: insert_grp,
    jwtToken: userDetails.toString(),
  });

  document.getElementById("texts").value = "";
});

socket.on("messageinsertionsuccessful", (data) => {
  getEveryMsg();
});

socket.on("msginsertionfailed", (data) => {
  console.log(data);
});
