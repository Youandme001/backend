const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const Category = require('./category.model'); // 🔄 Import category
const ProduitImage = require('./produitImage.model'); // ✅ Import ProduitImage

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
  name: { // 🛠️ Missing field "name"
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
      model: Category, // Relation with Category
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

// ✅ Establish associations:
Produit.belongsTo(Category, { foreignKey: 'categoryId', as: 'Category', onDelete: 'SET NULL' });
Category.hasMany(Produit, { foreignKey: 'categoryId' });

Produit.hasMany(ProduitImage, { foreignKey: 'product_id', as: 'images' });
ProduitImage.belongsTo(Produit, { foreignKey: 'product_id' });

sequelize.sync();
module.exports = Produit;
