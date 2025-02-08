const socket = io('http://localhost:7878');
const logInForm = document.getElementById('login-form');

logInForm.addEventListener('submit',async(e)=>{

    e.preventDefault();
    let getEmail = document.getElementById('email').value;
    let getPassword = document.getElementById('password').value;

    socket.emit('userlogincheck',{getEmail,getPassword});
  
})


socket.on('emailnotfound',(data)=>{

   let success = document.getElementById('email-error')
   success.style.display = 'block'
   setTimeout(() => {
      success.style.display = 'none'
   }, 3000);

})

socket.on('bcrypterror',(data)=>{

   let success = document.getElementById('uncaught-error')
   success.style.display = 'block'
   setTimeout(() => {
      success.style.display = 'none'
   }, 3000);

})

socket.on('passwordincorrecterror',(data)=>{

   let success = document.getElementById('password-error')
     success.style.display = 'block'
     setTimeout(() => {
        success.style.display = 'none'
     }, 3000);

})

socket.on('dberror',(data)=>{

   let success = document.getElementById('uncaught-error')
   success.style.display = 'block'
   setTimeout(() => {
      success.style.display = 'none'
   }, 3000);

})

socket.on('userloginsuccessfull',(data)=>{


   localStorage.setItem('userId',JSON.stringify(data.userId));

   let success = document.getElementById('login-success')
   success.style.display = 'block'
   setTimeout(() => {
      success.style.display = 'none'
      window.location.href = 'http://localhost:7878/chathome';
   }, 3000);

})


