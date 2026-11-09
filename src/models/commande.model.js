const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const STATES = ['pending', 'Confirmed', 'Delivered', 'Rejected'];

const Commande = sequelize.define('Commande', {
  userId: { type: DataTypes.INTEGER },
  commandeDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  // Products + shipping, computed by the server
  totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  shippingFee: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  state: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
});

Commande.STATES = STATES;

module.exports = Commande;
