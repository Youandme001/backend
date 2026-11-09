const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwtSecret } = require('../config/env');
const HttpError = require('../utils/httpError');

const PROFILE_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'address', 'gouvernorat', 'city', 'postalCode'];
const ADDRESS_FIELDS = ['firstName', 'lastName', 'phone', 'address', 'gouvernorat', 'city', 'postalCode'];

const pick = (body, fields) => Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

const sign = (user, guest = false) =>
  jwt.sign({ user: { id: user.id, ...(guest && { guest: true }) } }, jwtSecret, { expiresIn: guest ? '30m' : '2h' });

const publicUser = (user) => {
  const data = user.get({ plain: true });
  delete data.password;
  return data;
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.scope('withPassword').findOne({ where: { email } });
  // Same answer for an unknown email and a wrong password
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, 'Invalid credentials');
  }
  res.json({ message: 'Login successful', user: publicUser(user), token: sign(user) });
};

exports.register = async (req, res) => {
  const data = pick(req.body, PROFILE_FIELDS);
  if (await User.findOne({ where: { email: data.email } })) throw new HttpError(409, 'Email already exists');

  const samePhone = await User.scope('withPassword').findOne({ where: { phone: data.phone } });
  if (samePhone && samePhone.password) throw new HttpError(409, 'Phone already exists');

  const password = await bcrypt.hash(req.body.password, 10);
  // A guest who ordered before keeps their orders when signing up with the same phone
  const user = samePhone ? await samePhone.update({ ...data, password }) : await User.create({ ...data, password });
  res.status(201).json({ message: 'User created successfully', data: publicUser(user), token: sign(user) });
};

// Guest checkout: name + phone + address, short token only valid to place the order
exports.createGuest = async (req, res) => {
  const data = pick(req.body, ADDRESS_FIELDS);
  let user = await User.scope('withPassword').findOne({ where: { phone: data.phone } });

  if (user && user.password) {
    throw new HttpError(409, 'An account already uses this phone number, please log in');
  }
  user = user ? await user.update(data) : await User.create(data);

  res.json({ message: 'User created successfully', user: publicUser(user), token: sign(user, true) });
};

exports.getAll = async (req, res) => {
  const users = await User.findAll({ order: [['createdAt', 'DESC']] });
  res.json({ message: 'Users found', data: users });
};

exports.getById = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ message: 'User found', data: user });
};

exports.update = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  await user.update(pick(req.body, PROFILE_FIELDS));
  res.json({ message: 'User updated successfully', data: user });
};

exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.scope('withPassword').findByPk(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  if (!user.password || !(await bcrypt.compare(oldPassword || '', user.password))) {
    throw new HttpError(400, 'Current password is incorrect');
  }
  await user.update({ password: await bcrypt.hash(newPassword, 10) });
  res.json({ message: 'Password updated successfully' });
};

exports.remove = async (req, res) => {
  const count = await User.destroy({ where: { id: req.params.id } });
  if (!count) throw new HttpError(404, 'User not found');
  res.json({ message: 'User deleted successfully' });
};
