const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Todas las rutas requieren autenticación y rol de administrador
router.use(authenticateToken);
router.use(requireAdmin);

// ========== ADMINISTRACIÓN DE PROYECTOS ==========

// Obtener todos los proyectos (admin)
router.get("/projects", async (req, res) => {
  try {
    const { estado, search } = req.query;

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

    if (estado && estado !== "all") {
      // Filtrar explícitamente por estado solicitado, excepto Borrador
      if (estado === "Borrador") {
        // No exponer proyectos en borrador en el panel de administración
        return res.json([]);
      }
      query += " AND p.estado = ?";
      params.push(estado);
    } else {
      // Por defecto, ocultar proyectos en Borrador
      query += ' AND p.estado <> "Borrador"';
    }

    if (search) {
      query +=
        " AND (p.titulo LIKE ? OR p.descripcion LIKE ? OR u.nombre LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY p.fecha_creacion DESC";

    const [projects] = await pool.execute(query, params);

    res.json(projects);
  } catch (error) {
    console.error("Error obteniendo proyectos (admin):", error);
    res.status(500).json({ error: "Error al obtener proyectos" });
  }
});

// Aprobar proyecto
router.post("/projects/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    const [projects] = await pool.execute(
      "SELECT estado FROM proyectos WHERE id = ?",
      [id],
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    if (projects[0].estado !== "En Revisión") {
      return res
        .status(400)
        .json({ error: "Solo proyectos en revisión pueden ser aprobados" });
    }

    await pool.execute(
      'UPDATE proyectos SET estado = "Publicado" WHERE id = ?',
      [id],
    );

    res.json({ message: "Proyecto aprobado exitosamente" });
  } catch (error) {
    console.error("Error aprobando proyecto:", error);
    res.status(500).json({ error: "Error al aprobar proyecto" });
  }
});

// Observar proyecto
router.post("/projects/:id/observe", async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;

    if (!observaciones || observaciones.trim() === "") {
      return res
        .status(400)
        .json({ error: "Las observaciones son requeridas" });
    }

    const [projects] = await pool.execute(
      "SELECT estado FROM proyectos WHERE id = ?",
      [id],
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    if (projects[0].estado !== "En Revisión") {
      return res
        .status(400)
        .json({ error: "Solo proyectos en revisión pueden ser observados" });
    }

    // Cambiar estado a Observado
    await pool.execute(
      'UPDATE proyectos SET estado = "Observado" WHERE id = ?',
      [id],
    );

    // Guardar observación
    await pool.execute(
      "INSERT INTO observaciones (proyecto_id, administrador_id, texto, fecha) VALUES (?, ?, ?, NOW())",
      [id, req.user.id, observaciones],
    );

    res.json({ message: "Proyecto observado exitosamente" });
  } catch (error) {
    console.error("Error observando proyecto:", error);
    res.status(500).json({ error: "Error al observar proyecto" });
  }
});

// Rechazar proyecto
router.post("/projects/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;

    if (!observaciones || observaciones.trim() === "") {
      return res
        .status(400)
        .json({ error: "Las observaciones son requeridas" });
    }

    const [projects] = await pool.execute(
      "SELECT estado FROM proyectos WHERE id = ?",
      [id],
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    if (projects[0].estado !== "En Revisión") {
      return res
        .status(400)
        .json({ error: "Solo proyectos en revisión pueden ser rechazados" });
    }

    // Cambiar estado a Rechazado
    await pool.execute(
      'UPDATE proyectos SET estado = "Rechazado" WHERE id = ?',
      [id],
    );

    // Guardar observación
    await pool.execute(
      "INSERT INTO observaciones (proyecto_id, administrador_id, texto, fecha) VALUES (?, ?, ?, NOW())",
      [id, req.user.id, observaciones],
    );

    res.json({ message: "Proyecto rechazado exitosamente" });
  } catch (error) {
    console.error("Error rechazando proyecto:", error);
    res.status(500).json({ error: "Error al rechazar proyecto" });
  }
});

// Marcar proyecto como Borrador (por admin)
router.post("/projects/:id/draft", async (req, res) => {
  try {
    const { id } = req.params;

    const [projects] = await pool.execute(
      "SELECT estado FROM proyectos WHERE id = ?",
      [id],
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    await pool.execute(
      'UPDATE proyectos SET estado = "Borrador" WHERE id = ?',
      [id],
    );

    res.json({ message: "Proyecto marcado como Borrador exitosamente" });
  } catch (error) {
    console.error("Error marcando proyecto como borrador:", error);
    res.status(500).json({ error: "Error al marcar proyecto como borrador" });
  }
});

// ========== ADMINISTRACIÓN DE USUARIOS ==========

// Obtener todos los usuarios
router.get("/users", async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, nombre, email, rol, activado, fecha_registro FROM usuarios ORDER BY fecha_registro DESC",
    );

    res.json(users);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Crear administrador
router.post("/users", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar si el email ya existe
    const [existing] = await pool.execute(
      "SELECT id FROM usuarios WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "El correo electrónico ya está registrado" });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar administrador (activado automáticamente)
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre, email, password, rol, activado, fecha_registro) 
       VALUES (?, ?, ?, 'administrador', TRUE, NOW())`,
      [nombre, email, hashedPassword],
    );

    res.status(201).json({
      message: "Administrador creado exitosamente",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Error creando administrador:", error);
    res.status(500).json({ error: "Error al crear administrador" });
  }
});

// Actualizar usuario
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activado } = req.body;

    // Verificar que el usuario existe
    const [users] = await pool.execute("SELECT id FROM usuarios WHERE id = ?", [
      id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // No permitir cambiar el rol del super admin
    if (email === "admin@crowdfunding101.com" && rol !== "administrador") {
      return res
        .status(400)
        .json({
          error: "No se puede cambiar el rol del administrador principal",
        });
    }

    const updates = [];
    const params = [];

    if (nombre) {
      updates.push("nombre = ?");
      params.push(nombre);
    }

    if (email) {
      updates.push("email = ?");
      params.push(email);
    }

    if (rol) {
      updates.push("rol = ?");
      params.push(rol);
    }

    if (activado !== undefined) {
      updates.push("activado = ?");
      params.push(activado);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    params.push(id);

    await pool.execute(
      `UPDATE usuarios SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    res.json({ message: "Usuario actualizado exitosamente" });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// Activar usuario manualmente (admin)
router.post("/users/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(
      "SELECT id, activado FROM usuarios WHERE id = ?",
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (users[0].activado) {
      return res.status(400).json({ error: "El usuario ya está activado" });
    }

    await pool.execute(
      "UPDATE usuarios SET activado = TRUE, token_activacion = NULL WHERE id = ?",
      [id],
    );

    res.json({ message: "Usuario activado exitosamente" });
  } catch (error) {
    console.error("Error activando usuario:", error);
    res.status(500).json({ error: "Error al activar usuario" });
  }
});

// Eliminar usuario
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminar el super admin
    const [users] = await pool.execute(
      "SELECT email FROM usuarios WHERE id = ?",
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (users[0].email === "admin@crowdfunding101.com") {
      return res
        .status(400)
        .json({ error: "No se puede eliminar al administrador principal" });
    }

    // No permitir auto-eliminación
    if (parseInt(id) === req.user.id) {
      return res
        .status(400)
        .json({ error: "No puedes eliminar tu propia cuenta" });
    }

    await pool.execute("DELETE FROM usuarios WHERE id = ?", [id]);

    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

module.exports = router;
