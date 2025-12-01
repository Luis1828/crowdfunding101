const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const bootstrapData = require("./scripts/bootstrap-data");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/campaigns", require("./routes/campaigns"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/payments", require("./routes/payments"));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Endpoint no encontrado" });
  }
  return res.sendFile(path.join(__dirname, "index.html"));
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

async function startServer() {
  try {
    await bootstrapData();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar la aplicación:", error.message);
    process.exit(1);
  }
}

startServer();
