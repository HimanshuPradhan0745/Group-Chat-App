const jwt = require('jsonwebtoken');

exports.encryptuserid = (id,name) =>{
 

  return jwt.sign({userId: id, userName : name},process.env.JWT_TOKEN_SECRET);


}