const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const Category = require('./category.model'); // 🔄 Import category

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);

const Produit = sequelize.define('Produit', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
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
  designation: {
    type: DataTypes.STRING,
  },
  propertiesCosmetics: {
    type: DataTypes.STRING,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: Category, // Establish foreign key
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

// Establish association
Produit.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Category.hasMany(Produit, { foreignKey: 'categoryId' });

sequelize.sync();
module.exports = Produit;
