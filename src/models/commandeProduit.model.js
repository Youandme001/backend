const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommandeProduit = sequelize.define('CommandeProduit', {
  commandeId: { type: DataTypes.INTEGER, allowNull: false },
  // Null once the product is deleted from the catalogue; productName keeps the line readable
  produitId: { type: DataTypes.INTEGER },
  productName: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  // Price at order time, so later price changes don't rewrite history
  unitPrice: { type: DataTypes.DECIMAL(10, 2) },
});

module.exports = CommandeProduit;
