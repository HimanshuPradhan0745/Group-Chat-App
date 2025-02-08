const db = require('../models/data');

function checkuserAuth(email,password){
       db.execute('SELECT * FROM users WHERE email=?',[email]).then(resp =>{
        return 'user already exists'
       }).catch(err => {return err})
}

module.exports = checkuserAuth;