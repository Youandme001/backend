const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_DATABASE, 
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

  const Produit = sequelize.define('Produit', {
    id : {
        type: Sequelize.INTEGER,
        primaryKey: true, // Mark the field as a primary key
        autoIncrement: true, // Enable auto-incrementing for the primary key
        allowNull: false, // Prevent null values
      },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },
    volume: {
      type: DataTypes.INTEGER,
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
  sequelize.sync();
  module.exports = Produit;
