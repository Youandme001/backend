const Commande = require('../models/commande.model');
const Produit = require('../models/produit.model.js');

exports.createCommande = async (req, res) => {
  try {
    const { userId, produitIds, totalPrice } = req.body;

    // Ensure all produits exist:
    const existingProduits = await Produit.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: produitIds, 
        },
      },
    });
    if (existingProduits.length !== produitIds.length) {
      throw new Error('One or more produitIds do not exist');
    }

    const newCommande = await Commande.create({
      userId,
      totalPrice,
      commandeDate: new Date(), 
    });

    // Add produits using built-in association methods:
    await Promise.all(produitIds.map(async (produitId) => {
      const produit = existingProduits.find((p) => p.id === produitId);
      await newCommande.addProduit(produit); 
    }));

    res.status(201).json({ message: 'Commande created successfully', data: newCommande });
  } catch (error) {
    console.error('Error creating Commande:', error);
    res.status(500).json({ message: 'Error creating Commande' });
  }
};




exports.getAllCommande = async (req, res, next) => {
  try {
    const commandes = await Commande.findAll();
    if (!commandes) {
      return res.status(200).json({ message: 'No commandes found', data: [] });
    }
    res.status(200).json({ message: 'Success', data: commandes });
  } catch (err) {
    next(err);
  }
};

// Function to get a Commande by its ID
exports.getCommandeById = async (req, res) => {
  try {
    const commandeId = req.params.id;
    const commande = await Commande.findByPk(commandeId);
    if (!commande) {
      return res.status(404).json({ message: 'Commande not found' });
    }
    res.status(200).json({ message: 'Success', data: commande });
  } catch (error) {
    console.error('Error getting Commande:', error);
    res.status(500).json({ message: 'Error getting Commande' });
  }
};

// Function to update a Commande
exports.updateCommande = async (req, res) => {
  try {
    const commandeId = req.params.id;
    const updatedData = req.body;
    const [rowsAffected] = await Commande.update(updatedData, { where: { id: commandeId } });
    if (rowsAffected === 0) {
      return res.status(404).json({ message: 'Commande not found' });
    }
    res.status(200).json({ message: 'Commande updated successfully' });
  } catch (error) {
    console.error('Error updating Commande:', error);
    res.status(500).json({ message: 'Error updating Commande' });
  }
};

// Function to delete a Commande
exports.deleteCommande = async (req, res) => {
  try {
    const commandeId = req.params.id;
    const rowsAffected = await Commande.destroy({ where: { id: commandeId } });
    if (rowsAffected === 0) {
      return res.status(404).json({ message: 'Commande not found' });
    }
    res.status(200).json({ message: 'Commande deleted successfully' });
  } catch (error) {
    console.error('Error deleting Commande:', error);
    res.status(500).json({ message: 'Error deleting Commande' });
  }
};
