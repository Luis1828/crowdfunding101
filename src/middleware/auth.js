const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "tu_secreto_super_seguro_cambiar_en_produccion";

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido o expirado" });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== "administrador") {
    return res
      .status(403)
      .json({ error: "Acceso denegado. Se requiere rol de administrador" });
  }
  next();
};

// Middleware para verificar que el usuario está activado
const requireActivated = (req, res, next) => {
  if (!req.user.activado) {
    return res
      .status(403)
      .json({ error: "Cuenta no activada. Por favor verifica tu email" });
  }
  next();
};

// Middleware opcional para verificar token (no falla si no existe)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err && user) {
        req.user = user;
        console.log("OptionalAuth: Usuario autenticado:", user.id, user.rol);
      } else {
        console.log("OptionalAuth: Token inválido o expirado");
      }
      // Continuar incluso si el token es inválido (para acceso público)
      next();
    });
  } else {
    console.log("OptionalAuth: No hay token, continuando sin autenticación");
    // No hay token, continuar sin autenticación
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireActivated,
  optionalAuth,
  JWT_SECRET,
};
