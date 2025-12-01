const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const {
  authenticateToken,
  requireActivated,
  optionalAuth,
} = require("../middleware/auth");

// Obtener todos los proyectos (públicos o según filtros)
router.get("/", async (req, res) => {
  try {
    const { categoria, estado, search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT p.*, u.nombre as creador_nombre, c.nombre as categoria_nombre,
             (SELECT COALESCE(SUM(monto), 0) FROM donaciones WHERE proyecto_id = p.id) as recaudado,
             (SELECT COUNT(*) FROM donaciones WHERE proyecto_id = p.id) as backers
      FROM proyectos p
      INNER JOIN usuarios u ON p.creador_id = u.id
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Solo mostrar proyectos publicados si no es admin
    if (!req.user || req.user.rol !== "administrador") {
      query += ' AND p.estado = "Publicado"';
    } else if (estado && estado !== "all") {
      query += " AND p.estado = ?";
      params.push(estado);
    }

    if (categoria) {
      query += " AND c.nombre = ?";
      params.push(categoria);
    }

    if (search) {
      query +=
        " AND (p.titulo LIKE ? OR p.descripcion LIKE ? OR u.nombre LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY p.fecha_creacion DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [projects] = await pool.execute(query, params);

    // Calcular días restantes y porcentaje
    const projectsWithStats = projects.map((project) => {
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
    console.error("Error obteniendo proyectos:", error);
    res.status(500).json({ error: "Error al obtener proyectos" });
  }
});

// Obtener proyecto por ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // Convertir userId a número si existe
    let userId = null;
    let userRol = null;
    if (req.user && req.user.id) {
      userId =
        typeof req.user.id === "string" ? parseInt(req.user.id) : req.user.id;
      userRol = req.user.rol || null;
    }

    const [projects] = await pool.execute(
      `SELECT p.*, u.nombre as creador_nombre, u.id as creador_id, c.nombre as categoria_nombre,
              (SELECT COALESCE(SUM(monto), 0) FROM donaciones WHERE proyecto_id = p.id) as recaudado,
              (SELECT COUNT(*) FROM donaciones WHERE proyecto_id = p.id) as backers
       FROM proyectos p
       INNER JOIN usuarios u ON p.creador_id = u.id
       INNER JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ?`,
      [id],
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    const project = projects[0];
    const creadorId = parseInt(project.creador_id);

    console.log("Verificando acceso al proyecto:", {
      proyectoId: id,
      estado: project.estado,
      creadorId: creadorId,
      userId: userId,
      userRol: userRol,
      esCreador: userId === creadorId,
      esAdmin: userRol === "administrador",
    });

    // Verificar acceso (solo público o si es el creador/admin)
    // El creador y admin pueden ver proyectos en cualquier estado
    // Solo proyectos publicados son visibles públicamente
    if (project.estado !== "Publicado") {
      if (!userId) {
        console.log("Acceso denegado: No hay usuario autenticado");
        return res
          .status(403)
          .json({ error: "No tienes acceso a este proyecto" });
      }
      // Permitir acceso si es el creador o admin
      if (userId !== creadorId && userRol !== "administrador") {
        console.log("Acceso denegado: Usuario no es creador ni admin", {
          userId,
          creadorId,
          userRol,
        });
        return res
          .status(403)
          .json({ error: "No tienes acceso a este proyecto" });
      }
      console.log("Acceso permitido: Usuario es creador o admin");
    } else {
      console.log("Acceso permitido: Proyecto publicado");
    }

    // Obtener donaciones
    const [donations] = await pool.execute(
      "SELECT * FROM donaciones WHERE proyecto_id = ? ORDER BY fecha DESC",
      [id],
    );

    // Obtener top donadores
    const [topDonors] = await pool.execute(
      `SELECT nombre_mostrado, SUM(monto) as total
       FROM donaciones
       WHERE proyecto_id = ?
       GROUP BY nombre_mostrado
       ORDER BY total DESC
       LIMIT 10`,
      [id],
    );

    const recaudado = parseFloat(project.recaudado) || 0;
    const meta = parseFloat(project.meta);
    const porcentaje =
      meta > 0 ? Math.min(Math.round((recaudado / meta) * 100), 100) : 0;

    // Calcular días restantes
    let diasRestantes = 0;
    if (project.fecha_limite) {
      const fechaLimite = new Date(project.fecha_limite);
      const ahora = new Date();
      const diff = fechaLimite - ahora;
      diasRestantes = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    res.json({
      ...project,
      recaudado,
      porcentaje,
      diasRestantes,
      donaciones: donations,
      topDonadores: topDonors,
    });
  } catch (error) {
    console.error("Error obteniendo proyecto:", error);
    res.status(500).json({ error: "Error al obtener proyecto" });
  }
});

// Crear proyecto
router.post("/", authenticateToken, requireActivated, async (req, res) => {
  try {
    const { titulo, categoria_id, descripcion, meta, fecha_limite, imagen } =
      req.body;
    const creador_id = req.user.id;

    if (!titulo || !categoria_id || !descripcion || !meta || !fecha_limite) {
      return res
        .status(400)
        .json({ error: "Todos los campos requeridos deben ser completados" });
    }

    const [result] = await pool.execute(
      `INSERT INTO proyectos (titulo, categoria_id, descripcion, meta, fecha_limite, imagen, 
                             creador_id, estado, campaña_estado, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Borrador', 'No Iniciada', NOW())`,
      [
        titulo,
        categoria_id,
        descripcion,
        meta,
        fecha_limite,
        imagen,
        creador_id,
      ],
    );

    res.status(201).json({
      message: "Proyecto creado exitosamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creando proyecto:", error);
    res.status(500).json({ error: "Error al crear proyecto" });
  }
});

// Actualizar proyecto
router.put("/:id", authenticateToken, requireActivated, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, categoria_id, descripcion, meta, fecha_limite, imagen } =
      req.body;

    // Verificar que el proyecto pertenece al usuario
    const [projects] = await pool.execute(
      "SELECT creador_id, estado FROM proyectos WHERE id = ?",
      [id],
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    const project = projects[0];

    if (
      project.creador_id !== req.user.id &&
      req.user.rol !== "administrador"
    ) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para editar este proyecto" });
    }

    // Solo se puede editar si está en Borrador u Observado
    if (
      project.estado !== "Borrador" &&
      project.estado !== "Observado" &&
      req.user.rol !== "administrador"
    ) {
      return res
        .status(400)
        .json({
          error: "Este proyecto no puede ser editado en su estado actual",
        });
    }

    await pool.execute(
      `UPDATE proyectos 
       SET titulo = ?, categoria_id = ?, descripcion = ?, meta = ?, fecha_limite = ?, imagen = ?
       WHERE id = ?`,
      [titulo, categoria_id, descripcion, meta, fecha_limite, imagen, id],
    );

    res.json({ message: "Proyecto actualizado exitosamente" });
  } catch (error) {
    console.error("Error actualizando proyecto:", error);
    res.status(500).json({ error: "Error al actualizar proyecto" });
  }
});

// Eliminar proyecto
router.delete("/:id", authenticateToken, requireActivated, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el proyecto pertenece al usuario
    const [projects] = await pool.execute(
      "SELECT creador_id FROM proyectos WHERE id = ?",
      [id],
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    if (
      projects[0].creador_id !== req.user.id &&
      req.user.rol !== "administrador"
    ) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para eliminar este proyecto" });
    }

    await pool.execute("DELETE FROM proyectos WHERE id = ?", [id]);

    res.json({ message: "Proyecto eliminado exitosamente" });
  } catch (error) {
    console.error("Error eliminando proyecto:", error);
    res.status(500).json({ error: "Error al eliminar proyecto" });
  }
});

// Enviar proyecto para revisión
router.post(
  "/:id/submit",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que el proyecto pertenece al usuario
      const [projects] = await pool.execute(
        "SELECT creador_id, estado FROM proyectos WHERE id = ?",
        [id],
      );

      if (projects.length === 0) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      if (projects[0].creador_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para enviar este proyecto" });
      }

      if (
        projects[0].estado !== "Borrador" &&
        projects[0].estado !== "Observado"
      ) {
        return res
          .status(400)
          .json({
            error:
              "Solo proyectos en Borrador u Observado pueden ser enviados para revisión",
          });
      }

      await pool.execute(
        'UPDATE proyectos SET estado = "En Revisión" WHERE id = ?',
        [id],
      );

      res.json({ message: "Proyecto enviado para revisión exitosamente" });
    } catch (error) {
      console.error("Error enviando proyecto:", error);
      res.status(500).json({ error: "Error al enviar proyecto para revisión" });
    }
  },
);

// Obtener proyectos del usuario autenticado
router.get(
  "/user/my-projects",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const { estado } = req.query;

      let query = `
      SELECT p.*, c.nombre as categoria_nombre,
             (SELECT COALESCE(SUM(monto), 0) FROM donaciones WHERE proyecto_id = p.id) as recaudado,
             (SELECT COUNT(*) FROM donaciones WHERE proyecto_id = p.id) as backers
      FROM proyectos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.creador_id = ?
    `;
      const params = [req.user.id];

      if (estado && estado !== "all") {
        query += " AND p.estado = ?";
        params.push(estado);
      }

      query += " ORDER BY p.fecha_creacion DESC";

      const [projects] = await pool.execute(query, params);

      const projectsWithStats = projects.map((project) => {
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
      console.error("Error obteniendo proyectos del usuario:", error);
      res.status(500).json({ error: "Error al obtener proyectos" });
    }
  },
);

// Obtener observaciones de un proyecto
router.get("/:id/observations", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar acceso
    const [projects] = await pool.execute(
      "SELECT creador_id FROM proyectos WHERE id = ?",
      [id],
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    if (
      projects[0].creador_id !== req.user.id &&
      req.user.rol !== "administrador"
    ) {
      return res
        .status(403)
        .json({
          error: "No tienes acceso a las observaciones de este proyecto",
        });
    }

    const [observations] = await pool.execute(
      `SELECT o.*, u.nombre as administrador_nombre
       FROM observaciones o
       INNER JOIN usuarios u ON o.administrador_id = u.id
       WHERE o.proyecto_id = ?
       ORDER BY o.fecha DESC`,
      [id],
    );

    res.json(observations);
  } catch (error) {
    console.error("Error obteniendo observaciones:", error);
    res.status(500).json({ error: "Error al obtener observaciones" });
  }
});

module.exports = router;
