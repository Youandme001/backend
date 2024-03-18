const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const Produit = require('../models/produit.model.js');
const Commande = require('../models/commande.model.js');
const User = require('../models/user.model.js');

const sequelize = new Sequelize(
  process.env.DB_DATABASE, 
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const Sequelize = require('sequelize');

  const Produit = sequelize.define('Produit', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    volume: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  });
  CommandeProduit.belongsTo(Commande, { foreignKey: 'CommandeId' });
  CommandeProduit.belongsTo(Produit, { foreignKey: 'ProduitId' });
  sequelize.sync(); 

module.exports = CommandeProduit;