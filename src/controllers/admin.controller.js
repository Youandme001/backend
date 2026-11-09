const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const { jwtSecret } = require('../config/env');
const HttpError = require('../utils/httpError');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.scope('withPassword').findOne({ where: { email } });
  if (!admin || !(await bcrypt.compare(password || '', admin.password))) {
    throw new HttpError(401, 'Invalid credentials');
  }
  const token = jwt.sign({ admin: { id: admin.id } }, jwtSecret, { expiresIn: '12h' });
  res.json({ token, admin: { id: admin.id, email: admin.email } });
};

exports.me = async (req, res) => {
  const admin = await Admin.findByPk(req.auth.adminId);
  if (!admin) throw new HttpError(401, 'Admin not found');
  res.json({ data: admin });
};
