const { sequelize, Commande, CommandeProduit, Produit, ProduitImage, User } = require('../models');
const { shippingFee } = require('../config/env');
const HttpError = require('../utils/httpError');

const round2 = (n) => Math.round(n * 100) / 100;

const INCLUDE_DETAILS = [
  { model: User },
  {
    model: CommandeProduit,
    as: 'lignes',
    include: [{ model: Produit, include: [{ model: ProduitImage, as: 'images' }] }],
  },
];

// Shape returned to the shop and the admin (same keys as the 2024 API)
function toDto(commande) {
  return {
    id: commande.id,
    commandeDate: commande.commandeDate,
    totalPrice: commande.totalPrice,
    shippingFee: commande.shippingFee,
    state: commande.state,
    createdAt: commande.createdAt,
    updatedAt: commande.updatedAt,
    user: commande.User || null,
    products: (commande.lignes || []).map((l) => ({
      id: l.produitId,
      name: l.Produit ? l.Produit.name : 'Produit supprimé',
      price: l.unitPrice ?? (l.Produit ? l.Produit.price : null),
      quantity: l.quantity,
      image: l.Produit?.images?.[0]?.filepath || null,
    })),
  };
}

async function findAll(where = {}) {
  const rows = await Commande.findAll({ where, include: INCLUDE_DETAILS, order: [['createdAt', 'DESC']] });
  return rows.map(toDto);
}

async function findById(id) {
  const commande = await Commande.findByPk(id, { include: INCLUDE_DETAILS });
  if (!commande) throw new HttpError(404, 'Commande not found');
  return toDto(commande);
}

// Prices come from the database, never from the browser
async function create(userId, items) {
  const quantities = new Map();
  for (const item of items) {
    const id = Number(item.productId);
    const qty = Number(item.quantity);
    if (!Number.isInteger(id) || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      throw new HttpError(400, 'Invalid product or quantity');
    }
    quantities.set(id, (quantities.get(id) || 0) + qty);
  }

  const produits = await Produit.findAll({ where: { id: [...quantities.keys()] } });
  if (produits.length !== quantities.size) throw new HttpError(400, 'Some products no longer exist');

  for (const p of produits) {
    if (p.volume < quantities.get(p.id)) {
      throw new HttpError(409, `Not enough stock for ${p.name}`);
    }
  }

  const subtotal = produits.reduce((sum, p) => sum + Number(p.price) * quantities.get(p.id), 0);

  const commande = await sequelize.transaction(async (t) => {
    const created = await Commande.create(
      { userId, totalPrice: round2(subtotal + shippingFee), shippingFee, state: 'pending' },
      { transaction: t }
    );
    await CommandeProduit.bulkCreate(
      produits.map((p) => ({ commandeId: created.id, produitId: p.id, quantity: quantities.get(p.id), unitPrice: p.price })),
      { transaction: t }
    );
    return created;
  });

  return findById(commande.id);
}

// Stock leaves the shelf when an order is confirmed and comes back if it is rejected afterwards
async function updateState(id, state) {
  if (!Commande.STATES.includes(state)) throw new HttpError(400, `State must be one of ${Commande.STATES.join(', ')}`);

  await sequelize.transaction(async (t) => {
    const commande = await Commande.findByPk(id, {
      include: [{ model: CommandeProduit, as: 'lignes' }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!commande) throw new HttpError(404, 'Commande not found');

    const wasReserved = ['Confirmed', 'Delivered'].includes(commande.state);
    const willReserve = ['Confirmed', 'Delivered'].includes(state);

    if (!wasReserved && willReserve) {
      for (const l of commande.lignes) {
        const produit = await Produit.findByPk(l.produitId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!produit) continue;
        if (produit.volume < l.quantity) throw new HttpError(409, `Not enough stock for ${produit.name}`);
        await produit.decrement('volume', { by: l.quantity, transaction: t });
      }
    } else if (wasReserved && !willReserve) {
      for (const l of commande.lignes) {
        await Produit.increment('volume', { by: l.quantity, where: { id: l.produitId }, transaction: t });
      }
    }

    await commande.update({ state }, { transaction: t });
  });
}

async function remove(id) {
  const count = await Commande.destroy({ where: { id } });
  if (!count) throw new HttpError(404, 'Commande not found');
}

module.exports = { findAll, findById, create, updateState, remove };
