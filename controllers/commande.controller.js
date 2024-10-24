const Commande = require('../models/commande.model');
const Produit = require('../models/produit.model.js');
const User = require('../models/user.model.js');
const CommandeProduit = require('../models/CommandeProduit.model.js');
const Sequelize = require('sequelize');

exports.createCommande = async (req, res) => {
  try {
    const { userId, products, totalPrice } = req.body;

    // Create new Commande
    const newCommande = await Commande.create({
      userId,
      totalPrice,
      state: 'pending', // Assuming 'state' is set to 'pending' by default
    });

    // Create CommandeProduit for each product
    await Promise.all(
      products.map(async (product) => {
        return await CommandeProduit.create({
          produitId: product.productId,
          quantity: product.quantity,
          commandeId: newCommande.id,
        });
      })
    );

    res.status(201).json({ message: 'Commande created successfully', data: newCommande });
  } catch (error) {
    console.error('Error creating Commande:', error);
    res.status(500).json({ message: 'Error creating Commande' });
  }
};

exports.getAllCommande = async (req, res, next) => {
  try {
    const commandes = await Commande.findAll();
    const commandesWithProducts = await Promise.all(commandes.map(async (commande) => {
      const user = await User.findOne({
        where: { id: commande.userId },
        attributes: { exclude: ['password'] }
      });

      const commandeProduits = await CommandeProduit.findAll({
        where: { commandeId: commande.id }
      });

      const products = await Promise.all(commandeProduits.map(async (cp) => {
        const produit = await Produit.findByPk(cp.produitId);
        return {
          id: produit.id,
          name: produit.name,
          price: produit.price, // Use 'price' from the produit model
          quantity: cp.quantity // Add quantity field
        };
      }));

      return {
        id: commande.id,
        commandeDate: commande.commandeDate,
        totalPrice: commande.totalPrice,
        state: commande.state,
        createdAt: commande.createdAt,
        updatedAt: commande.updatedAt,
        user: user,
        products: products
      };
    }));
    res.status(200).json({ message: "Success", data: commandesWithProducts });
  } catch (err) {
    next(err);
  }
};

// Function to get a Commande by its ID
exports.getCommandeById = async (req, res) => {
  try {
    const commandeId = req.params.id;
    const commande = await Commande.findByPk(commandeId, {
      include: [{
        model: User,
        attributes: { exclude: ['password'] }
      }, {
        model: CommandeProduit,
        include: [{
          model: Produit
        }]
      }]
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande not found' });
    }

    const user = commande.User;
    const products = commande.CommandeProduits.map(cp => ({
      id: cp.Produit.id,
      name: cp.Produit.name,
      price: cp.Produit.price,
      quantity: cp.quantity
    }));

    const commandeData = {
      id: commande.id,
      commandeDate: commande.commandeDate,
      totalPrice: commande.totalPrice,
      state: commande.state,
      createdAt: commande.createdAt,
      updatedAt: commande.updatedAt,
      user: user,
      products: products
    };

    res.status(200).json({ message: 'Success', data: commandeData });
  } catch (error) {
    console.error('Error getting Commande:', error);
    res.status(500).json({ message: 'Error getting Commande' });
  }
};

exports.getAllCommandsForUser = async (req, res, next) => {
  try {
    const userId = req.params.id; // Assuming you're passing the user ID through params

    // Find all commands for the specified user
    const commands = await Commande.findAll({
      where: { userId },
    });

    // Process commands and include user and product details
    const commandsWithProducts = await Promise.all(commands.map(async (command) => {
      const user = await User.findOne({
        where: { id: command.userId },
        attributes: { exclude: ['password'] }
      });

      const commandProducts = await CommandeProduit.findAll({
        where: { commandeId: command.id }
      });

      const products = await Promise.all(commandProducts.map(async (cp) => {
        const product = await Produit.findByPk(cp.produitId);
        return {
          id: product.id,
          name: product.name,
          price: product.price, // Use 'price' from the produit model
          quantity: cp.quantity // Add quantity field
        };
      }));

      return {
        id: command.id,
        commandeDate: command.commandeDate,
        totalPrice: command.totalPrice,
        state: command.state,
        createdAt: command.createdAt,
        updatedAt: command.updatedAt,
        user: user,
        products: products
      };
    }));

    // Return the commands with products for the specified user
    res.status(200).json({ message: "Success", data: commandsWithProducts });
  } catch (err) {
    // Handle errors
    next(err);
  }
};

// Function to update a Commande
exports.updateCommande = async (req, res) => {
  try {
    const commandeId = req.params.id;
    const { state } = req.body;

    const commande = await Commande.findByPk(commandeId, {
      include: Produit, // Include Produit model directly
    });

    if (!commande) {
      return res.status(404).json({ message: 'Commande not found' });
    }

    // Update the state of the commande
    await commande.update({ state });

    // If the state is "Confirmed", decrease the quantity of each produit in CommandeProduit
    if (state === 'Confirmed') {
      for (const produit of commande.Produits) {
        const commandeProduit = await CommandeProduit.findOne({
          where: { produitId: produit.id, commandeId }
        });
        if (commandeProduit && commandeProduit.quantity > 0) { // Check if commandeProduit exists
          // Find the product associated with the CommandeProduit
          const produitToUpdate = await Produit.findByPk(produit.id);
    
          // Decrement the volume of the product by commandeProduit.quantity
          if (produitToUpdate.volume >= commandeProduit.quantity) {
            await produitToUpdate.decrement('volume', { by: commandeProduit.quantity });
          } else {
            console.error(`Insufficient volume for product ${produitToUpdate.name}`);
          }
        }
      }
    }
    
    res.status(200).json({ message: 'Commande state updated successfully' });
  } catch (error) {
    console.error('Error updating Commande state:', error);
    res.status(500).json({ message: 'Error updating Commande state' });
  }
};

// Function to delete a Commande
exports.deleteCommande = async (req, res) => {
  try {
    const commandeId = req.params.id;
    const commande = await Commande.findByPk(commandeId);

    if (!commande) {
      return res.status(404).json({ message: 'Commande not found' });
    }

    // Delete the associated CommandeProduits
    await CommandeProduit.destroy({ where: { commandeId } });

    // Delete the Commande
    await Commande.destroy({ where: { id: commandeId } });

    res.status(200).json({ message: 'Commande deleted successfully' });
  } catch (error) {
    console.error('Error deleting Commande:', error);
    res.status(500).json({ message: 'Error deleting Commande' });
  }
};
