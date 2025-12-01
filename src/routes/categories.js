const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const [categories] = await pool.execute(
      "SELECT * FROM categorias ORDER BY nombre",
    );

    res.json(categories);
  } catch (error) {
    console.error("Error obteniendo categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

// Obtener categoría por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [categories] = await pool.execute(
      "SELECT * FROM categorias WHERE id = ?",
      [id],
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json(categories[0]);
  } catch (error) {
    console.error("Error obteniendo categoría:", error);
    res.status(500).json({ error: "Error al obtener categoría" });
  }
});

module.exports = router;
