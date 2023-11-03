const { sign, verify } = require('jsonwebtoken');
require('dotenv').config();

// sign jwt.
const createToken = (userDetails) => {

  const accessToken = sign(
    { username: userDetails.username, id: userDetails._id, email: userDetails.email, phoneNo: userDetails.phoneNo, },
    process.env.SECRETE
  );

  return accessToken;

};

// verify jwt.
const validateToken = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if(!authorizationHeader){
       return  res.status(401).send("No Authorization Header")
    }
    const val = authorizationHeader.split(" ");
    const tokenType = val[0];
    const tokenValue = val[1];
    if(tokenType ==='Bearer'){
        const decoded = verify(tokenValue, process.env.SECRETE );
        req.userDetails = decoded;
        next();
        return;
    }
    res.status(401).json({ message: 'User not authorized' });
    
  } catch (error) {
   res.status(500).json({ message: error.message });
  }

};


module.exports = { createToken, validateToken };
