const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produit = sequelize.define('Produit', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  // Stock available (historical column name kept for the existing database)
  volume: { type: DataTypes.INTEGER, defaultValue: 0 },
  designation: { type: DataTypes.STRING },
  propertiesCosmetics: { type: DataTypes.STRING },
  categoryId: { type: DataTypes.INTEGER },
});

module.exports = Produit;
