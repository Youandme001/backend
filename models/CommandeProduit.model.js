const { Sequelize, DataTypes } = require('sequelize');
const Commande = require('./commande.model'); // Assuming you have a Commande model defined
const Produit = require('./produit.model'); // Assuming you have a Produit model defined

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
    references: {
      model: Commande, // Use the Commande model reference
      key: 'id',
    },
  },
  produitId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Produit, // Use the Produit model reference
      key: 'id',
    },
  },
});

// Define relationships
Commande.belongsToMany(Produit, { through: CommandeProduit, foreignKey: 'commandeId' });
Produit.belongsToMany(Commande, { through: CommandeProduit, foreignKey: 'produitId' });

// Sync the models
sequelize.sync();

module.exports = CommandeProduit;
