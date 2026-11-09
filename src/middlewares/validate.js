const { validationResult } = require('express-validator');

// Runs after express-validator chains; returns 400 with the first message
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array();
  res.status(400).json({ message: errors[0].msg, errors });
};
