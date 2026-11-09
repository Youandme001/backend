const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define(
  'Admin',
  {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
  },
  {
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: { withPassword: { attributes: { include: ['password'] } } },
  }
);

module.exports = Admin;
