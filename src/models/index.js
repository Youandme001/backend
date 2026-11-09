const sequelize = require('../config/database');
const Admin = require('./admin.model');
const Category = require('./category.model');
const Produit = require('./produit.model');
const ProduitImage = require('./produitImage.model');
const User = require('./user.model');
const Commande = require('./commande.model');
const CommandeProduit = require('./commandeProduit.model');

Category.hasMany(Produit, { foreignKey: 'categoryId' });
Produit.belongsTo(Category, { foreignKey: 'categoryId', as: 'Category', onDelete: 'SET NULL' });

Produit.hasMany(ProduitImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' });
ProduitImage.belongsTo(Produit, { foreignKey: 'product_id' });

User.hasMany(Commande, { foreignKey: 'userId' });
Commande.belongsTo(User, { foreignKey: 'userId' });

Commande.hasMany(CommandeProduit, { foreignKey: 'commandeId', as: 'lignes', onDelete: 'CASCADE' });
CommandeProduit.belongsTo(Commande, { foreignKey: 'commandeId' });
CommandeProduit.belongsTo(Produit, { foreignKey: 'produitId' });

module.exports = { sequelize, Admin, Category, Produit, ProduitImage, User, Commande, CommandeProduit };
