const { Sequelize, DataTypes } = require('sequelize');

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
    type: DataTypes.INTEGER,
    primaryKey: true, 
    autoIncrement: true, 
    allowNull: false, 
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: true,
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

// ❌ NO Produit.belongsTo here directly

module.exports = ProduitImage;
