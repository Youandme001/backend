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
const auth=  function (req, res, next) {
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

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Access token is required' });
  }
  const accessToken = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded.user) {
      return res.status(200).json({ message: 'Unauthorized: Access token is required' });
    }
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(200).json({ message: 'Unauthorized: Access token is required' });
    }
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Access token is required' });
  }
  const accessToken = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded.admin) {
      return res.status(200).json({ message: 'Unauthorized: Access token is required' });
    }
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(200).json({ message: 'Unauthorized: Access token is required' });
    }
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};
module.exports = {
  authenticateUser,
  authenticateAdmin,
  auth
}