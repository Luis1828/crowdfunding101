const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/database");
const { authenticateToken, JWT_SECRET } = require("../middleware/auth");
const { sendActivationEmail } = require("../utils/email");

// Registro de usuario
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Validación mejorada de contraseña
    const passwordErrors = [];
    if (password.length < 6) {
      passwordErrors.push("La contraseña debe tener al menos 6 caracteres");
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push("Debe contener al menos una letra minúscula");
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push("Debe contener al menos una letra mayúscula");
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push("Debe contener al menos un número");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      passwordErrors.push("Debe contener al menos un carácter especial");
    }

    if (passwordErrors.length > 0) {
      return res.status(400).json({ error: passwordErrors.join(". ") });
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

    // Generar token de activación
    const activationToken = uuidv4();

    // Insertar usuario
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre, email, password, rol, activado, token_activacion, fecha_registro) 
       VALUES (?, ?, ?, 'usuario', FALSE, ?, NOW())`,
      [nombre, email, hashedPassword, activationToken],
    );

    // Enviar email de activación real
    await sendActivationEmail(email, activationToken);

    res.status(201).json({
      message:
        "Usuario registrado exitosamente. Revisa tu email y confirma tu cuenta antes de iniciar sesión.",
      userId: result.insertId,
      pendingEmail: email,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Activar cuenta
router.get("/activate/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const [users] = await pool.execute(
      "SELECT id FROM usuarios WHERE token_activacion = ? AND activado = FALSE",
      [token],
    );

    if (users.length === 0) {
      return res
        .status(400)
        .json({ error: "Token de activación inválido o ya utilizado" });
    }

    await pool.execute(
      "UPDATE usuarios SET activado = TRUE, token_activacion = NULL WHERE id = ?",
      [users[0].id],
    );

    res.json({ message: "Cuenta activada exitosamente" });
  } catch (error) {
    console.error("Error en activación:", error);
    res.status(500).json({ error: "Error al activar cuenta" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son requeridos" });
    }

    // Buscar usuario
    const [users] = await pool.execute(
      "SELECT id, nombre, email, password, rol, activado FROM usuarios WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = users[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Verificar que la cuenta esté activada (excepto para administradores)
    if (!user.activado && user.rol !== "administrador") {
      return res.status(403).json({
        error:
          "Cuenta no activada. Por favor verifica tu email o contacta al administrador para activar tu cuenta.",
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
        activado: user.activado,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Obtener usuario actual
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, nombre, email, rol, activado FROM usuarios WHERE id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    res.status(500).json({ error: "Error al obtener información del usuario" });
  }
});

module.exports = router;
