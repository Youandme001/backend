const Produit = require('../models/produit.model.js');
const  ProduitImage = require('../models/produitImage.model.js');
const upload = require('../middlewares/upload.js');
const path = require('path'); // Assuming model is in ../models
const { Sequelize } = require('sequelize');
const util = require("util");

  // Ensure model is imported with Sequelize instance
  async function getAllProduits() {
    try {
      const produits = await Produit.findAll();
      return produits;
    } catch (err) {
      console.error("Error retrieving produits:", err);
      throw new Error("An error occurred while retrieving produits");
    }
  }

  async function getProduitById({id : id }) {
    try {
      console.log("Fetching produit with ID:", id);
      const produit = await Produit.findByPk(id, {
        include: ProduitImage // Include the ProduitImage model to fetch associated images
      });
      if (!produit) {
        console.error("Produit not found for ID:", id);
        throw new Error("Produit not found!");
      }
      return produit;
    } catch (err) {
      console.error("Error getting produit:", err);
      throw new Error("An error occurred while getting produit");
    }
  }
  

//   async function createProduit(productData) {
//     try {
//         const { name, description, price, volume , images } = productData;
//         const newProduit = await Produit.create({
//             name,
//             description,
//             price,
//             volume,
//         });
//         uploadMultiple( res, async (err) => {
//           if (err) {
//             return res.status(500).json({ message: err.message });
//           }
//           const productImages = [];
//           for (const file of req.files) {
//             const productImage = await ProduitImage.create({
//               product_id: newProduit.id, 
//               filename: file.filename,
//               filepath: file.path,
//             });
//           }
//         });
//         return { success: true };
//     } catch (err) {
//         console.error("Error creating produit:", err);
//         throw new Error("Failed to create product");
//     }
// }

  async function updateProduit({ id, ...data }) {
    try {
      if (data.image) {
        if (!data.image || !data.image.mimetype.startsWith('image/')) {
          throw new Error('Invalid image file');
        }
          const filename = `${Date.now()}-${data.image.originalname}`;
          const uploadPath = path.join(__dirname, '../uploads/', filename);
          await fs.writeFile(uploadPath, data.image.buffer);
  
        data.image = filename;
      }
      const updatedProduitCount = await Produit.update(data, { where: { id } });
      if (updatedProduitCount[0] === 0) {
        throw new Error("Produit not found!");
      }
      return { success: true };
    } catch (err) {
      console.error("Error updating produit:", err);
      throw new Error("An error occurred while updating produit");
    }
  }
  

  async  function deleteProduit({ id }) {
    try {
      const deletedProduitCount = await Produit.destroy({ where: { id } });
      if (deletedProduitCount === 0) {
        throw new Error("Produit not found!");
      }
      else{
        return{ success: true };
      }
    } catch (err) {
      console.error("Error deleting produit:", err);
      throw new Error("An error occurred while deleting produit");
    }
  }
module.exports = {
    getAllProduits,
    getProduitById,
    updateProduit,
    deleteProduit
  };
  

