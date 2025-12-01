const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mariadb",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "rootpassword",
  database: process.env.DB_NAME || "crowdfunding_db",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection
pool
  .getConnection()
  .then((connection) => {
    console.log("Conexión a la base de datos establecida");
    connection.release();
  })
  .catch((error) => {
    console.error("Error conectando a la base de datos:", error.message);
  });

module.exports = pool;
