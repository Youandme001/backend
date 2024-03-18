const Sequelize = require('sequelize');
const Produit = require('../models/produit.model.js');

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);

const ProduitImage = sequelize.define('ProduitImage', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true, 
    autoIncrement: true, 
    allowNull: false, 
  },
  product_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Produit, // Reference to the Produit model
      key: 'id',  // Column in the Produit table to reference
    },
  },
  filename: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  filepath: {
    type: Sequelize.STRING,
    allowNull: true, // Allow filepath to be null if not used
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

// Define the association
ProduitImage.belongsTo(Produit, { foreignKey: 'product_id', onDelete: 'CASCADE' }); 

// Sync the models with the database
sequelize.sync(); 

module.exports = ProduitImage;
