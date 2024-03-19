const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_DATABASE, 
    process.env.DB_USER,
    process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  });

const Admin = sequelize.define('Admin', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
sequelize.sync();
module.exports = Admin;