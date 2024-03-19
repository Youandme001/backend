// const jwt = require("jsonwebtoken");

// function authenticateToken(req, res, next) {  
//   const authHeader = req.headers['authorization'] 
//   const token = authHeader && authHeader.split(' ')[1] 

//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, "process.env.TOKEN_SECRET", (err, user) => {
//     console.log(err);
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// }

// function generateAccessToken(email) {
//   return jwt.sign({ data: email }, process.env.TOKEN_SECRET, {
//     expiresIn: "1h",
//   });
// }

// module.exports = {
//   authenticateToken,
//   generateAccessToken,
// };

const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded.admin;
    next();
  } catch (error) {
    console.error('Token validation failed:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
