const { Category, Produit } = require('../models');
const HttpError = require('../utils/httpError');

async function findOr404(id) {
  const category = await Category.findByPk(id);
  if (!category) throw new HttpError(404, 'Category not found');
  return category;
}

exports.getAll = async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.json({ message: 'Success', data: categories });
};

exports.getById = async (req, res) => {
  res.json({ message: 'Success', data: await findOr404(req.params.id) });
};

exports.create = async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.status(201).json({ message: 'Category created successfully', data: category });
};

exports.update = async (req, res) => {
  const category = await findOr404(req.params.id);
  const { name, description } = req.body;
  await category.update({ name, description });
  res.json({ message: 'Category updated successfully', data: category });
};

// Products of a deleted category stay in the shop, without category
exports.remove = async (req, res) => {
  const category = await findOr404(req.params.id);
  await Produit.update({ categoryId: null }, { where: { categoryId: category.id } });
  await category.destroy();
  res.json({ message: 'Category deleted successfully' });
};
