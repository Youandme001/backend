// Creates (or resets) an admin account: npm run create-admin -- email@example.com "StrongPassword"
const bcrypt = require('bcryptjs');
const { sequelize, Admin } = require('../src/models');

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password || password.length < 8) {
    console.error('Usage: npm run create-admin -- <email> <password (8+ characters)>');
    process.exit(1);
  }
  await sequelize.sync();
  const hash = await bcrypt.hash(password, 10);
  const [admin, created] = await Admin.findOrCreate({ where: { email }, defaults: { password: hash } });
  if (!created) await Admin.update({ password: hash }, { where: { id: admin.id } });
  console.log(`${created ? 'Created' : 'Updated'} admin ${email}`);
  await sequelize.close();
}

main().catch(async (err) => {
  console.error(err);
  await sequelize.close();
  process.exit(1);
});
