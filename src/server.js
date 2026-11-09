const { port } = require('./config/env');
const { sequelize } = require('./models');
const app = require('./app');

async function start() {
  await sequelize.authenticate();
  // Creates missing tables; DB_SYNC_ALTER=true once adds the new columns to a 2024 database
  await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' });
  app.listen(port, () => console.log(`Glowy API ready on http://localhost:${port}`));
}

start().catch((err) => {
  console.error('Could not start the API:', err.message);
  process.exit(1);
});
