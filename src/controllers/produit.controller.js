const fs = require('fs/promises');
const path = require('path');
const { Produit, ProduitImage, Category } = require('../models');
const { UPLOAD_DIR } = require('../middlewares/upload');
const HttpError = require('../utils/httpError');

const INCLUDE = [
  { model: ProduitImage, as: 'images' },
  { model: Category, as: 'Category' },
];
const FIELDS = ['name', 'description', 'price', 'volume', 'designation', 'propertiesCosmetics', 'categoryId'];

const pick = (body) => {
  const data = {};
  for (const key of FIELDS) if (body[key] !== undefined) data[key] = body[key] === '' ? null : body[key];
  return data;
};

const saveImages = (produitId, files = []) =>
  ProduitImage.bulkCreate(
    files.map((f) => ({ product_id: produitId, filename: f.filename, filepath: `/uploads/produit/${f.filename}` }))
  );

async function deleteImageFiles(images) {
  await Promise.all(images.map((img) => fs.unlink(path.join(UPLOAD_DIR, img.filename)).catch(() => {})));
}

const findWithDetails = (id) => Produit.findByPk(id, { include: INCLUDE });

exports.getAll = async (req, res) => {
  const where = req.query.categoryId ? { categoryId: req.query.categoryId } : {};
  const produits = await Produit.findAll({ where, include: INCLUDE, order: [['createdAt', 'DESC']] });
  res.json({ message: 'Success', data: produits });
};

exports.getById = async (req, res) => {
  const produit = await findWithDetails(req.params.id);
  if (!produit) throw new HttpError(404, 'Produit not found');
  res.json({ message: 'Success', data: produit });
};

exports.create = async (req, res) => {
  const produit = await Produit.create(pick(req.body));
  await saveImages(produit.id, req.files);
  res.status(201).json({ message: 'Product created successfully!', data: await findWithDetails(produit.id) });
};

// New images replace the old ones; without new images the old ones are kept
exports.update = async (req, res) => {
  const produit = await findWithDetails(req.params.id || req.body.id);
  if (!produit) throw new HttpError(404, 'Produit not found');

  await produit.update(pick(req.body));
  if (req.files && req.files.length > 0) {
    await deleteImageFiles(produit.images);
    await ProduitImage.destroy({ where: { product_id: produit.id } });
    await saveImages(produit.id, req.files);
  }
  res.json({ message: 'Product updated successfully!', data: await findWithDetails(produit.id) });
};

exports.remove = async (req, res) => {
  const produit = await findWithDetails(req.params.id);
  if (!produit) throw new HttpError(404, 'Produit not found');
  await produit.destroy();
  await deleteImageFiles(produit.images);
  res.json({ message: 'Success' });
};
