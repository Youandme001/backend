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

const CommandeProduit = sequelize.define('CommandeProduit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    commandeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { // Foreign key constraint
        model: 'Commande',
        key: 'id',
      },
    },
    produitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { // Foreign key constraint
        model: 'Produit',
        key: 'id',
      },
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
  Commande.belongsTo(User, { foreignKey: 'userId' });

  Commande.belongsToMany(Produit, { through: 'CommandeProduit', foreignKey: 'commandeId' });

  Produit.belongsToMany(Commande, { through: 'CommandeProduit', foreignKey: 'produitId' });
  sequelize.sync(); 

module.exports = CommandeProduit;