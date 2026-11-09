const commandeService = require('../services/commande.service');
const statsService = require('../services/stats.service');
const HttpError = require('../utils/httpError');

exports.getAll = async (req, res) => {
  const where = req.query.state ? { state: req.query.state } : {};
  res.json({ message: 'Success', data: await commandeService.findAll(where) });
};

exports.getStats = async (req, res) => {
  res.json(await statsService.dashboard());
};

exports.getById = async (req, res) => {
  res.json({ message: 'Success', data: await commandeService.findById(req.params.id) });
};

exports.getForUser = async (req, res) => {
  res.json({ message: 'Success', data: await commandeService.findAll({ userId: req.params.id }) });
};

// The customer comes from the token, the total from the database
exports.create = async (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) throw new HttpError(400, 'The cart is empty');
  const commande = await commandeService.create(req.auth.userId, products);
  res.status(201).json({ message: 'Commande created successfully', data: commande });
};

exports.updateState = async (req, res) => {
  await commandeService.updateState(req.params.id, req.body.state);
  res.json({ message: 'Commande state updated successfully' });
};

exports.remove = async (req, res) => {
  await commandeService.remove(req.params.id);
  res.json({ message: 'Commande deleted successfully' });
};
