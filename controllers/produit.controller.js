const ProduitService = require('../services/produit.services.js');
const Produit = require('../models/produit.model.js');
const ProduitImage = require('../models/produitImage.model.js');
const ip = "http://localhost:4000/uploads/produit/";

exports.createProduit = async (req, res, next) => {
  try {
    const { name, description, price, volume, designation, propertiesCosmetics } = req.body;
    const newProduit = await Produit.create({ name, description, price, volume, designation, propertiesCosmetics });
    const produitId = newProduit.id;
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(async (image) => {
        return await ProduitImage.create({
          product_id: produitId,
          filename: image.filename,
          filepath: ip + image.filename,
        });
      });
      await Promise.all(imagePromises);
    }
    res.status(201).json({ message: 'Product created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating product' });
  }
};

exports.getAllProduits = async (req, res, next) => {
  try {
    const produits = await Produit.findAll();
    const productsWithImages = await Promise.all(produits.map(async (produit) => {
      const images = await ProduitImage.findAll({
        where: { product_id: produit.id }
      });
      return {
        ...produit.toJSON(),
        images: images 
      };
    }));
    res.status(200).json({ message: "Success", data: productsWithImages });
  } catch (err) {
    next(err);
  }
};

exports.getProduitById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const produit = await Produit.findByPk(id);
    if (!produit) {
      res.status(404).json({ message: 'Produit not found' });
      return;
    }
    const images = await ProduitImage.findAll({
      where: { product_id: produit.id }
    });
    const productWithImages = {
      ...produit.toJSON(),
      images: images 
    };

    res.status(200).json({ message: "Success", data: productWithImages });
  } catch (err) {
    next(err);
  }
};

exports.updateProduit = async (req, res, next) => {
  try {
    const { id, name, description, price, volume, designation, propertiesCosmetics } = req.body;
    const existingProduit = await Produit.findByPk(id);
    if (!existingProduit) {
      throw new Error('Produit not found');
    }
    await existingProduit.update({ name, description, price, volume, designation, propertiesCosmetics });
    if (req.files && req.files.length > 0) {
      await ProduitImage.destroy({ where: { product_id: id } });
      const imagePromises = req.files.map(async (image) => {
        return await ProduitImage.create({
          product_id: id,
          filename: image.filename,
          filepath: ip + image.filename,
        });
      });
      await Promise.all(imagePromises);
    }

    res.status(200).json({ message: 'Product updated successfully!' });
  } catch (err) {
    if (err.message === 'Produit not found') {
      res.status(404).json({ message: err.message });
    } else {
      console.error(err);
      res.status(400).json({ message: 'Error updating product' });
    }
  }
};

exports.deleteProduit = async (req, res, next) => {
  try {
    const result = await ProduitService.deleteProduit(req.params.id);
    res.status(200).json({ message: "Success" });
  } catch (err) {
    if (err.message === 'Produit not found') {
      res.status(404).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error deleting produit' });
    }
  }
};
