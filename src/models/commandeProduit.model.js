const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommandeProduit = sequelize.define('CommandeProduit', {
  commandeId: { type: DataTypes.INTEGER, allowNull: false },
  produitId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  // Price at order time, so later price changes don't rewrite history
  unitPrice: { type: DataTypes.DECIMAL(10, 2) },
});

module.exports = CommandeProduit;
