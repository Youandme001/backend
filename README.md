# Glowy — API

API REST de la boutique en ligne **Glowy** (cosmétiques, Tunisie) : catalogue, catégories, clients, commandes avec paiement à la livraison et statistiques pour le tableau de bord.

Projets liés : [boutique (client)](https://github.com/Youandme001/client) · [tableau de bord (admin)](https://github.com/Youandme001/admin)

## Stack

Node.js 18+ · Express 4 · Sequelize 6 / MySQL · JWT · Multer · Helmet · express-validator · express-rate-limit

## Structure

```
src/
  config/        env.js (variables d'environnement), database.js (connexion Sequelize unique)
  models/        Admin, Category, Produit, ProduitImage, User, Commande, CommandeProduit + associations
  middlewares/   auth (admin / client / propriétaire), upload, validate, errorHandler, asyncHandler
  services/      commande.service (total calculé côté serveur, stock), stats.service (tableau de bord)
  controllers/   une fonction par route
  routes/        toutes les routes de l'API
  app.js         application Express
  server.js      démarrage (connexion + sync)
scripts/         seed.js (données de démo), create-admin.js
uploads/produit/ images des produits (non versionnées)
```

## Démarrage local

```bash
npm install
cp .env.example .env        # renseigner DB_* et un JWT_SECRET long et aléatoire
npm run seed                # ATTENTION : recrée toutes les tables avec des données de démo
npm run dev                 # http://localhost:4000
```

Comptes de démo créés par le seed : admin `admin@glowy.tn` / `Admin@2026`, clientes `amira.demo@example.com` (etc.) / `Client@2026`.

En production, créer l'administrateur avec `npm run create-admin -- <email> <mot de passe>` (l'inscription admin n'est pas exposée).

## Routes

| Méthode | Route | Accès |
|---|---|---|
| GET | `/produit`, `/produit/:id` | public |
| POST | `/produit/create` (multipart, champ `images`, 6 max) | admin |
| PUT | `/produit/update` (`id` dans le corps) ou `/produit/update/:id` | admin |
| DELETE | `/produit/delete/:id` | admin |
| GET | `/categories`, `/categories/:id` | public |
| POST / PUT / DELETE | `/categories/create`, `/categories/:id` | admin |
| POST | `/user/login`, `/user/create` (inscription) | public |
| POST | `/user/create1` (commande sans compte : jeton invité de 30 min) | public |
| GET / PUT | `/user/:id`, `/user/update/:id`, `/user/updatePassword/:id` | le client lui-même ou admin |
| GET / DELETE | `/user`, `/user/delete/:id` | admin |
| POST | `/commande/create` (`products: [{ productId, quantity }]`) | client ou invité |
| GET | `/commande/userById/:id` | le client lui-même ou admin |
| GET | `/commande`, `/commande/:id`, `/commande/stats` | admin |
| PUT / DELETE | `/commande/update/:id` (`state`), `/commande/delete/:id` | admin |
| POST | `/admin/login` · GET `/admin/me` | public · admin |

Jeton : en-tête `Authorization: Bearer <token>`. Statuts de commande : `pending` → `Confirmed` → `Delivered`, ou `Rejected`. Le stock (`volume`) est retiré à la confirmation et rendu si la commande est rejetée ensuite.

## Sécurité (refonte 2026)

- Total de commande recalculé à partir des prix en base (+ frais de livraison `SHIPPING_FEE`), prix unitaire figé dans la ligne de commande.
- Un client ne peut lire ou modifier que son propre profil et ses propres commandes ; suppression des comptes réservée à l'admin.
- Le hash du mot de passe n'est jamais renvoyé ; champs modifiables filtrés.
- Commande invitée : un numéro déjà lié à un compte doit se connecter ; le jeton invité ne sert qu'à passer la commande.
- Images : noms aléatoires, formats image uniquement, 5 Mo max.
- Helmet, limitation des tentatives de connexion, codes HTTP corrects (401 / 403 / 404 / 409).
- `.env` et `node_modules` retirés du dépôt. **Les identifiants présents dans l'historique Git avant 2026 doivent être considérés comme publics et changés.**

## Base existante (2024–2025)

Les noms de tables sont inchangés. Pour ajouter les nouvelles colonnes (`Commandes.shippingFee`, `CommandeProduits.unitPrice` / `productName`, `produitId` nullable) à une base existante, démarrer une fois avec `DB_SYNC_ALTER=true`.
