const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken, requireActivated } = require("../middleware/auth");

// Hacer una donación
router.post(
  "/projects/:id",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { monto, nombre_mostrado } = req.body;
      const usuario_id = req.user.id;

      if (!monto || monto <= 0) {
        return res.status(400).json({ error: "El monto debe ser mayor a 0" });
      }

      // Verificar que el proyecto existe y está activo
      const [projects] = await pool.execute(
        "SELECT estado, campaña_estado FROM proyectos WHERE id = ?",
        [id],
      );

      if (projects.length === 0) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      const project = projects[0];

      if (project.estado !== "Publicado") {
        return res
          .status(400)
          .json({ error: "Este proyecto no está disponible para donaciones" });
      }

      if (project.campaña_estado !== "En Progreso") {
        return res
          .status(400)
          .json({ error: "La campaña de este proyecto no está activa" });
      }

      // Verificar que no sea el creador del proyecto
      const [creators] = await pool.execute(
        "SELECT creador_id FROM proyectos WHERE id = ?",
        [id],
      );

      if (creators[0].creador_id === usuario_id) {
        return res
          .status(400)
          .json({ error: "No puedes donar a tu propio proyecto" });
      }

      // Obtener nombre del usuario si no se proporciona
      const [users] = await pool.execute(
        "SELECT nombre FROM usuarios WHERE id = ?",
        [usuario_id],
      );

      const nombre = nombre_mostrado || users[0].nombre;

      // Insertar donación
      await pool.execute(
        "INSERT INTO donaciones (proyecto_id, usuario_id, monto, nombre_mostrado, fecha) VALUES (?, ?, ?, ?, NOW())",
        [id, usuario_id, monto, nombre],
      );

      // Actualizar monto recaudado del proyecto
      const [sumResult] = await pool.execute(
        "SELECT COALESCE(SUM(monto), 0) as total FROM donaciones WHERE proyecto_id = ?",
        [id],
      );

      // Verificar si se alcanzó la meta o fecha límite
      const [projectData] = await pool.execute(
        "SELECT meta, fecha_limite FROM proyectos WHERE id = ?",
        [id],
      );

      const totalRecaudado = parseFloat(sumResult[0].total);
      const meta = parseFloat(projectData[0].meta);
      const fechaLimite = new Date(projectData[0].fecha_limite);
      const ahora = new Date();

      // Si se alcanzó la meta o pasó la fecha límite, finalizar campaña
      if (totalRecaudado >= meta || ahora >= fechaLimite) {
        await pool.execute(
          'UPDATE proyectos SET campaña_estado = "Finalizada" WHERE id = ?',
          [id],
        );
      }

      res.status(201).json({
        message: "Donación realizada exitosamente",
        monto,
        totalRecaudado,
      });
    } catch (error) {
      console.error("Error realizando donación:", error);
      res.status(500).json({ error: "Error al realizar donación" });
    }
  },
);

// Obtener donaciones de un proyecto
router.get("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [donations] = await pool.execute(
      "SELECT * FROM donaciones WHERE proyecto_id = ? ORDER BY fecha DESC",
      [id],
    );

    res.json(donations);
  } catch (error) {
    console.error("Error obteniendo donaciones:", error);
    res.status(500).json({ error: "Error al obtener donaciones" });
  }
});

// Obtener mis aportes
router.get(
  "/user/my-contributions",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const [contributions] = await pool.execute(
        `SELECT d.*, 
              p.id as proyecto_id,
              p.titulo as proyecto_titulo, 
              p.imagen as proyecto_imagen, 
              u.nombre as proyecto_creador
       FROM donaciones d
       INNER JOIN proyectos p ON d.proyecto_id = p.id
       INNER JOIN usuarios u ON p.creador_id = u.id
       WHERE d.usuario_id = ?
       ORDER BY d.fecha DESC`,
        [req.user.id],
      );

      res.json(contributions);
    } catch (error) {
      console.error("Error obteniendo aportes:", error);
      res.status(500).json({ error: "Error al obtener aportes" });
    }
  },
);

// Obtener resumen de aportes
router.get(
  "/user/summary",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const [summary] = await pool.execute(
        `SELECT 
        COALESCE(SUM(monto), 0) as total,
        COUNT(DISTINCT proyecto_id) as proyectos_apoyados
       FROM donaciones
       WHERE usuario_id = ?`,
        [req.user.id],
      );

      const result = summary[0] || { total: 0, proyectos_apoyados: 0 };
      console.log("Resumen de aportes para usuario", req.user.id, ":", result); // Debug
      res.json(result);
    } catch (error) {
      console.error("Error obteniendo resumen:", error);
      res.status(500).json({ error: "Error al obtener resumen" });
    }
  },
);

module.exports = router;
