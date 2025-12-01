const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken, requireActivated } = require("../middleware/auth");

// Agregar a favoritos
router.post(
  "/:projectId",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const usuario_id = req.user.id;

      // Verificar que el proyecto existe
      const [projects] = await pool.execute(
        "SELECT id FROM proyectos WHERE id = ?",
        [projectId],
      );

      if (projects.length === 0) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      // Verificar si ya está en favoritos
      const [existing] = await pool.execute(
        "SELECT id FROM favoritos WHERE usuario_id = ? AND proyecto_id = ?",
        [usuario_id, projectId],
      );

      if (existing.length > 0) {
        return res
          .status(400)
          .json({ error: "El proyecto ya está en tus favoritos" });
      }

      // Agregar a favoritos
      await pool.execute(
        "INSERT INTO favoritos (usuario_id, proyecto_id, fecha) VALUES (?, ?, NOW())",
        [usuario_id, projectId],
      );

      res.status(201).json({ message: "Proyecto agregado a favoritos" });
    } catch (error) {
      console.error("Error agregando a favoritos:", error);
      res.status(500).json({ error: "Error al agregar a favoritos" });
    }
  },
);

// Quitar de favoritos
router.delete(
  "/:projectId",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const usuario_id = req.user.id;

      await pool.execute(
        "DELETE FROM favoritos WHERE usuario_id = ? AND proyecto_id = ?",
        [usuario_id, projectId],
      );

      res.json({ message: "Proyecto eliminado de favoritos" });
    } catch (error) {
      console.error("Error eliminando de favoritos:", error);
      res.status(500).json({ error: "Error al eliminar de favoritos" });
    }
  },
);

// Obtener favoritos del usuario
router.get(
  "/user/my-favorites",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const [favorites] = await pool.execute(
        `SELECT p.*, c.nombre as categoria_nombre, u.nombre as creador_nombre,
              (SELECT COALESCE(SUM(monto), 0) FROM donaciones WHERE proyecto_id = p.id) as recaudado,
              (SELECT COUNT(*) FROM donaciones WHERE proyecto_id = p.id) as backers
       FROM favoritos f
       INNER JOIN proyectos p ON f.proyecto_id = p.id
       INNER JOIN categorias c ON p.categoria_id = c.id
       INNER JOIN usuarios u ON p.creador_id = u.id
       WHERE f.usuario_id = ?
       ORDER BY f.fecha DESC`,
        [req.user.id],
      );

      const projectsWithStats = favorites.map((project) => {
        const recaudado = parseFloat(project.recaudado) || 0;
        const meta = parseFloat(project.meta);
        const porcentaje =
          meta > 0 ? Math.min(Math.round((recaudado / meta) * 100), 100) : 0;

        let diasRestantes = 0;
        if (project.fecha_limite) {
          const fechaLimite = new Date(project.fecha_limite);
          const ahora = new Date();
          const diff = fechaLimite - ahora;
          diasRestantes = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }

        return {
          ...project,
          recaudado,
          porcentaje,
          diasRestantes,
        };
      });

      res.json(projectsWithStats);
    } catch (error) {
      console.error("Error obteniendo favoritos:", error);
      res.status(500).json({ error: "Error al obtener favoritos" });
    }
  },
);

// Verificar si un proyecto está en favoritos
router.get(
  "/:projectId/check",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const usuario_id = req.user.id;

      const [favorites] = await pool.execute(
        "SELECT id FROM favoritos WHERE usuario_id = ? AND proyecto_id = ?",
        [usuario_id, projectId],
      );

      res.json({ isFavorite: favorites.length > 0 });
    } catch (error) {
      console.error("Error verificando favorito:", error);
      res.status(500).json({ error: "Error al verificar favorito" });
    }
  },
);

module.exports = router;
