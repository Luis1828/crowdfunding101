const mysql = require("mysql2/promise");
require("dotenv").config();

const initPasswords = require("./init-passwords");
const restoreProjects = require("./restore-projects");
const initCampaigns = require("./init-campaigns");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDatabase(retries = 15, delay = 4000) {
  const config = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "rootpassword",
    database: process.env.DB_NAME || "crowdfunding_db",
    port: Number(process.env.DB_PORT) || 3306,
  };

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const connection = await mysql.createConnection(config);
      await connection.execute("SELECT 1");
      await connection.end();
      console.log("Base de datos disponible.");
      return;
    } catch (error) {
      console.log(
        `Esperando base de datos (${attempt}/${retries}): ${error.message}`,
      );
      if (attempt === retries) {
        throw new Error("La base de datos no respondió a tiempo.");
      }
      await sleep(delay);
    }
  }
}

async function bootstrapData() {
  await waitForDatabase();
  await initPasswords();
  await restoreProjects();
  await initCampaigns();
}

module.exports = bootstrapData;

if (require.main === module) {
  bootstrapData()
    .then(() => {
      console.log("Datos iniciales listos.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("No se pudieron inicializar los datos:", error.message);
      process.exit(1);
    });
}

