const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken, requireActivated } = require("../middleware/auth");

// Iniciar campaña
router.post(
  "/:id/start",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que el proyecto pertenece al usuario
      const [projects] = await pool.execute(
        "SELECT creador_id, estado, campaña_estado, fecha_limite FROM proyectos WHERE id = ?",
        [id],
      );

      if (projects.length === 0) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      const project = projects[0];

      if (project.creador_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para iniciar esta campaña" });
      }

      if (project.estado !== "Publicado") {
        return res
          .status(400)
          .json({ error: "Solo proyectos publicados pueden iniciar campaña" });
      }

      if (project.campaña_estado !== "No Iniciada") {
        return res
          .status(400)
          .json({ error: "La campaña ya ha sido iniciada" });
      }

      // Verificar que la fecha límite sea futura
      if (new Date(project.fecha_limite) <= new Date()) {
        return res
          .status(400)
          .json({ error: "La fecha límite debe ser futura" });
      }

      await pool.execute(
        'UPDATE proyectos SET campaña_estado = "En Progreso" WHERE id = ?',
        [id],
      );

      res.json({ message: "Campaña iniciada exitosamente" });
    } catch (error) {
      console.error("Error iniciando campaña:", error);
      res.status(500).json({ error: "Error al iniciar campaña" });
    }
  },
);

// Pausar campaña
router.post(
  "/:id/pause",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [projects] = await pool.execute(
        "SELECT creador_id, estado, campaña_estado FROM proyectos WHERE id = ?",
        [id],
      );

      if (projects.length === 0) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      const project = projects[0];

      if (project.creador_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para pausar esta campaña" });
      }

      if (project.campaña_estado !== "En Progreso") {
        return res
          .status(400)
          .json({ error: "Solo campañas en progreso pueden ser pausadas" });
      }

      await pool.execute(
        'UPDATE proyectos SET campaña_estado = "En Pausa" WHERE id = ?',
        [id],
      );

      res.json({ message: "Campaña pausada exitosamente" });
    } catch (error) {
      console.error("Error pausando campaña:", error);
      res.status(500).json({ error: "Error al pausar campaña" });
    }
  },
);

// Reanudar campaña
router.post(
  "/:id/resume",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [projects] = await pool.execute(
        "SELECT creador_id, estado, campaña_estado, fecha_limite FROM proyectos WHERE id = ?",
        [id],
      );

      if (projects.length === 0) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      const project = projects[0];

      if (project.creador_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para reanudar esta campaña" });
      }

      if (project.campaña_estado !== "En Pausa") {
        return res
          .status(400)
          .json({ error: "Solo campañas pausadas pueden ser reanudadas" });
      }

      // Verificar que la fecha límite no haya pasado
      if (new Date(project.fecha_limite) <= new Date()) {
        return res
          .status(400)
          .json({
            error: "No se puede reanudar una campaña cuya fecha límite ya pasó",
          });
      }

      await pool.execute(
        'UPDATE proyectos SET campaña_estado = "En Progreso" WHERE id = ?',
        [id],
      );

      res.json({ message: "Campaña reanudada exitosamente" });
    } catch (error) {
      console.error("Error reanudando campaña:", error);
      res.status(500).json({ error: "Error al reanudar campaña" });
    }
  },
);

module.exports = router;
