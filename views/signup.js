const socket = io("http://localhost:7878");

const signupForm = document.getElementById("signup-form");

socket.on("connect", () => {
  console.log("Connected to the server");

  socket.emit("exampleEvent", { message: "Hello, Server!" });
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("clicked");
  let uName = document.getElementById("name").value;
  let uEmail = document.getElementById("email").value;
  let uPhone = document.getElementById("phone").value;
  let uPassword = document.getElementById("password").value;

  socket.emit("insertnewuser", { uName, uEmail, uPhone, uPassword });
});

socket.on("successfulinsertion", (data) => {
  let success = document.getElementById("user-created");
  success.style.display = "block";

  setTimeout(() => {
    success.style.display = "none";
    window.location.href = "http://localhost:7878/login";
  }, 3000);
});

socket.on("duplicateuser", (data) => {
  let success = document.getElementById("user-exists");
  success.style.display = "block";
  setTimeout(() => {
    success.style.display = "none";
  }, 3000);
});

socket.on("error", (data) => {
  let success = document.getElementById("uncaught-error");
  success.style.display = "block";
  setTimeout(() => {
    success.style.display = "none";
  }, 3000);
});
