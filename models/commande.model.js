const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const Produit = require('../models/produit.model.js');
const User = require('../models/user.model.js');

// Assuming you have Sequelize configured for your database
const sequelize = new Sequelize(
  process.env.DB_DATABASE, 
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const Commande = sequelize.define('Commande', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  commandeDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  totalPrice: {
    type: DataTypes.DECIMAL, // Adjust precision/scale as needed
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

// Define relationships (assuming you have User and Produit models)
Commande.belongsTo(User, { foreignKey: 'userId' }); // User-Commande association
Commande.belongsToMany(Produit, { through: 'CommandeProduit' }); // Many-to-Many association with Produit

sequelize.sync(); 

module.exports = Commande;
