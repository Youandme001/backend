const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { publicUrl } = require('../config/env');

const ProduitImage = sequelize.define('ProduitImage', {
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  filename: { type: DataTypes.STRING, allowNull: false },
  // Stored relative (/uploads/produit/x.jpg); old rows may hold a full URL
  filepath: {
    type: DataTypes.STRING,
    get() {
      const value = this.getDataValue('filepath');
      if (!value) return value;
      if (/^https?:\/\//.test(value)) {
        // Old absolute links pointed to a host that no longer exists
        const idx = value.indexOf('/uploads/');
        return idx >= 0 ? publicUrl + value.slice(idx) : value;
      }
      return publicUrl + value;
    },
  },
});

module.exports = ProduitImage;
