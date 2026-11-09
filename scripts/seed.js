// Demo data for a LOCAL database: drops and recreates every table.
// Usage: npm run seed
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { sequelize, Admin, Category, Produit, ProduitImage, User, Commande, CommandeProduit } = require('../src/models');
const { UPLOAD_DIR } = require('../src/middlewares/upload');
const { shippingFee } = require('../src/config/env');

const ADMIN = { email: 'admin@glowy.tn', password: 'Admin@2026' };
const CUSTOMER_PASSWORD = 'Client@2026';

const CATEGORIES = [
  { name: 'Gloss', description: 'Gloss brillants et hydratants' },
  { name: 'Coffrets', description: 'Coffrets cadeaux Glowy' },
  { name: 'Offres', description: 'Packs et offres du moment' },
];

const PRODUCTS = [
  { name: 'Gloss Rosy', category: 'Gloss', price: 25, volume: 40, image: 'gloss-rosy.jpg', designation: 'Gloss rose transparent', propertiesCosmetics: 'Hydratant, non collant', description: 'Un rose léger et brillant pour un effet lèvres repulpées au quotidien.' },
  { name: 'Gloss Fushy', category: 'Gloss', price: 25, volume: 32, image: 'gloss-fushy.jpg', designation: 'Gloss fuchsia', propertiesCosmetics: 'Haute brillance, tenue 6 h', description: 'Une teinte fuchsia intense qui illumine le visage.' },
  { name: 'Gloss Shiny', category: 'Gloss', price: 27, volume: 4, image: 'gloss-shiny.jpg', designation: 'Gloss nude brique', propertiesCosmetics: 'Effet miroir, vitamine E', description: 'Un nude chaud à l\'effet miroir, idéal du matin au soir.' },
  { name: 'Coffret Baby', category: 'Coffrets', price: 69, volume: 15, image: 'coffret-baby.jpg', designation: 'Gloss + 2 baumes', propertiesCosmetics: 'Coffret cadeau', description: 'Le coffret signature : un gloss rose et deux baumes à lèvres dans une boîte noire Glowy.' },
  { name: 'Coffret Nude', category: 'Coffrets', price: 69, volume: 12, image: 'coffret-nude.jpg', designation: 'Gloss nude + 2 baumes', propertiesCosmetics: 'Coffret cadeau', description: 'La version nude du coffret Glowy, pour un look naturel.' },
  { name: 'Coffret Rosé', category: 'Coffrets', price: 69, volume: 3, image: 'coffret-rose.jpg', designation: 'Gloss rosé + 2 baumes', propertiesCosmetics: 'Coffret cadeau', description: 'Un rosé lumineux accompagné de deux baumes nourrissants.' },
  { name: 'Offre Beauté Primer', category: 'Offres', price: 95, volume: 20, image: 'offre-beaute.jpg', designation: 'Primer 30 ml + 3 gloss', propertiesCosmetics: 'Primer hydratant, base lissante', description: 'Le pack complet : un primer hydratant et trois gloss pour préparer et sublimer.' },
];

// Fictional customers (no real data)
const CUSTOMERS = [
  ['Amira', 'Ben Salah', 'amira.demo@example.com', '22111001', 'Tunis', 'La Marsa', '2070'],
  ['Yasmine', 'Trabelsi', 'yasmine.demo@example.com', '22111002', 'Sousse', 'Hammam Sousse', '4011'],
  ['Sarra', 'Gharbi', 'sarra.demo@example.com', '22111003', 'Nabeul', 'Hammamet', '8050'],
  ['Ines', 'Jaziri', null, '22111004', 'Sfax', 'Sfax Ville', '3000'],
  ['Rania', 'Mejri', 'rania.demo@example.com', '22111005', 'Ariana', 'Ennasr', '2037'],
  ['Mariem', 'Khelifi', null, '22111006', 'Monastir', 'Monastir', '5000'],
];

const STATES = ['Delivered', 'Delivered', 'Confirmed', 'Delivered', 'pending', 'Rejected', 'Confirmed', 'Delivered'];

function daysAgo(days, hour = 11) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, (days * 7) % 60, 0, 0);
  return d;
}

async function main() {
  await sequelize.sync({ force: true });

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  await Admin.create({ email: ADMIN.email, password: await bcrypt.hash(ADMIN.password, 10) });

  const categories = {};
  for (const c of CATEGORIES) categories[c.name] = await Category.create(c);

  const produits = [];
  for (const p of PRODUCTS) {
    const { image, category, ...data } = p;
    const produit = await Produit.create({ ...data, categoryId: categories[category].id });
    fs.copyFileSync(path.join(__dirname, 'seed-images', image), path.join(UPLOAD_DIR, image));
    await ProduitImage.create({ product_id: produit.id, filename: image, filepath: `/uploads/produit/${image}` });
    produits.push(produit);
  }

  const password = await bcrypt.hash(CUSTOMER_PASSWORD, 10);
  const users = [];
  for (const [firstName, lastName, email, phone, gouvernorat, city, postalCode] of CUSTOMERS) {
    users.push(
      await User.create({
        firstName, lastName, email, phone, gouvernorat, city, postalCode,
        address: `${10 + users.length * 7} rue des Jasmins`,
        password: email ? password : null,
      })
    );
  }

  // ~40 orders spread over the last 6 months, a few of them today
  let n = 0;
  for (let days = 170; days >= 0; days -= 4 + (n % 3)) {
    const user = users[n % users.length];
    const picks = [produits[n % produits.length], produits[(n * 3 + 1) % produits.length]].slice(0, 1 + (n % 2));
    const lignes = picks.map((p, i) => ({ produit: p, quantity: 1 + ((n + i) % 2) }));
    const subtotal = lignes.reduce((s, l) => s + Number(l.produit.price) * l.quantity, 0);
    const date = daysAgo(days, 9 + (n % 10));
    const state = days < 3 ? 'pending' : STATES[n % STATES.length];

    const commande = await Commande.create({
      userId: user.id, totalPrice: subtotal + shippingFee, shippingFee, state,
      commandeDate: date, createdAt: date, updatedAt: date,
    });
    await CommandeProduit.bulkCreate(
      lignes.map((l) => ({ commandeId: commande.id, produitId: l.produit.id, quantity: l.quantity, unitPrice: l.produit.price }))
    );
    n += 1;
  }
  for (let i = 0; i < 2; i += 1) {
    const date = daysAgo(0, 9 + i);
    const commande = await Commande.create({ userId: users[i + 2].id, totalPrice: 25 + shippingFee, shippingFee, state: 'pending', commandeDate: date, createdAt: date, updatedAt: date });
    await CommandeProduit.create({ commandeId: commande.id, produitId: produits[i].id, quantity: 1, unitPrice: 25 });
  }

  console.log(`Seed OK: ${produits.length} products, ${users.length} customers, ${n + 2} orders`);
  console.log(`Admin: ${ADMIN.email} / ${ADMIN.password} — customers: <email> / ${CUSTOMER_PASSWORD}`);
  await sequelize.close();
}

main().catch(async (err) => {
  console.error(err);
  await sequelize.close();
  process.exit(1);
});
