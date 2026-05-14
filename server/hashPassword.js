// server/hashPassword.js
const bcrypt = require('bcrypt');

async function run() {
  const saltRounds = 10;
  const hash = await bcrypt.hash('Admin@123', saltRounds);
  console.log('New hash:', hash);
}
run();