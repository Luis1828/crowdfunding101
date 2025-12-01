const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config();

const users = [
  { email: "admin@crowdfunding101.com", password: "Admin123!" },
  { email: "maria@example.com", password: "User123!" },
  { email: "carlos@example.com", password: "User123!" },
  { email: "ana@example.com", password: "User123!" },
  { email: "test@test.com", password: "Test123!" },
];

async function initPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "rootpassword",
    database: process.env.DB_NAME || "crowdfunding_db",
  });

  try {
    console.log("Inicializando contraseñas...");

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.execute("UPDATE usuarios SET password = ? WHERE email = ?", [
        hashedPassword,
        user.email,
      ]);
      console.log(`✓ Contraseña actualizada para ${user.email}`);
    }

    console.log("Contraseñas listas.");
    users.forEach((u) => console.log(`  - ${u.email} / ${u.password}`));
  } catch (error) {
    console.error("Error inicializando contraseñas:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = initPasswords;

if (require.main === module) {
  initPasswords()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
