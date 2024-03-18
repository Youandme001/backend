const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
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
      model: 'Produit', 
      key: 'id',  
    },
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: true, // Allow filepath to be null if not used
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

ProduitImage.belongsTo(Produit, { foreignKey: 'product_id', onDelete: 'CASCADE' }); 

sequelize.sync(); 

module.exports = ProduitImage;
