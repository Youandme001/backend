const { Op, fn, col } = require('sequelize');
const { Commande, CommandeProduit, Produit } = require('../models');

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

async function dashboard() {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today.getTime() + 86400000);
  const yesterday = new Date(today.getTime() - 86400000);
  const sold = { state: { [Op.in]: ['Confirmed', 'Delivered'] } };

  const [confirmedCount, confirmedTotal, pendingCount, todayCount, yesterdayCount, rejectedCount, lowStock] =
    await Promise.all([
      Commande.count({ where: sold }),
      Commande.sum('totalPrice', { where: sold }),
      Commande.count({ where: { state: 'pending' } }),
      Commande.count({ where: { createdAt: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
      Commande.count({ where: { createdAt: { [Op.gte]: yesterday, [Op.lt]: today } } }),
      Commande.count({ where: { state: 'Rejected' } }),
      Produit.count({ where: { volume: { [Op.lte]: 5 } } }),
    ]);

  let percentChange = '0.00';
  if (yesterdayCount > 0) percentChange = (((todayCount - yesterdayCount) / yesterdayCount) * 100).toFixed(2);
  else if (todayCount > 0) percentChange = '100.00';

  // Revenue of the last 6 months (confirmed + delivered)
  const since = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const rows = await Commande.findAll({
    attributes: [
      [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
      [fn('SUM', col('totalPrice')), 'total'],
      [fn('COUNT', col('id')), 'count'],
    ],
    where: { ...sold, createdAt: { [Op.gte]: since } },
    group: ['month'],
    raw: true,
  });
  const monthly = [];
  for (let i = 0; i < 6; i += 1) {
    const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const row = rows.find((r) => r.month === key);
    monthly.push({ month: key, total: row ? Number(row.total) : 0, count: row ? Number(row.count) : 0 });
  }

  const best = await CommandeProduit.findAll({
    attributes: ['produitId', [fn('SUM', col('quantity')), 'quantity']],
    include: [{ model: Produit, attributes: ['name'] }],
    group: ['produitId', 'Produit.id'],
    order: [[fn('SUM', col('quantity')), 'DESC']],
    limit: 5,
  });

  return {
    confirmedTotal: Number(confirmedTotal) || 0,
    confirmedCount,
    pendingCount,
    rejectedCount,
    todayCount,
    percentChange,
    lowStock,
    monthly,
    bestSellers: best.map((b) => ({ id: b.produitId, name: b.Produit?.name, quantity: Number(b.get('quantity')) })),
  };
}

module.exports = { dashboard };
