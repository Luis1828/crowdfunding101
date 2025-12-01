const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authenticateToken, requireActivated } = require("../middleware/auth");

// Configuración del payment gateway
const PAYMENT_GATEWAY_URL =
  process.env.PAYMENT_GATEWAY_URL || "http://payment-gateway:3000";
const CONFIRMATION_HOOK_ENDPOINT =
  process.env.CONFIRMATION_HOOK_ENDPOINT ||
  "http://app:3000/api/payments/confirm";

// Crear pago a través del gateway
router.post(
  "/create",
  authenticateToken,
  requireActivated,
  async (req, res) => {
    try {
      const { monto, proyecto_id, nombre_mostrado } = req.body;
      const usuario_id = req.user.id;

      if (!monto || monto <= 0) {
        return res.status(400).json({ error: "El monto debe ser mayor a 0" });
      }

      if (!proyecto_id) {
        return res.status(400).json({ error: "El proyecto es requerido" });
      }

      // Verificar que el proyecto existe y está activo
      const [projects] = await pool.execute(
        "SELECT estado, campaña_estado, creador_id FROM proyectos WHERE id = ?",
        [proyecto_id],
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

      if (project.creador_id === usuario_id) {
        return res
          .status(400)
          .json({ error: "No puedes donar a tu propio proyecto" });
      }

      // Crear pago en el gateway
      try {
        const gatewayResponse = await fetch(`${PAYMENT_GATEWAY_URL}/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ monto }),
        });

        if (!gatewayResponse.ok) {
          const error = await gatewayResponse.json();
          return res
            .status(gatewayResponse.status)
            .json({ error: error.error || "Error creando pago en gateway" });
        }

        const paymentData = await gatewayResponse.json();

        // Guardar información del pago pendiente en nuestra BD
        await pool.execute(
          `INSERT INTO pagos_pendientes (pago_id, proyecto_id, usuario_id, monto, nombre_mostrado, estado, fecha_creacion)
         VALUES (?, ?, ?, ?, ?, 'PENDING', NOW())`,
          [
            paymentData.id,
            proyecto_id,
            usuario_id,
            monto,
            nombre_mostrado || req.user.nombre,
          ],
        );

        res.status(201).json({
          paymentId: paymentData.id,
          qrUrl: paymentData.qr,
          status: paymentData.estado,
          monto: monto,
        });
      } catch (error) {
        console.error("Error comunicándose con payment gateway:", error);
        return res
          .status(500)
          .json({ error: "Error comunicándose con el gateway de pagos" });
      }
    } catch (error) {
      console.error("Error creando pago:", error);
      res.status(500).json({ error: "Error al crear pago" });
    }
  },
);

// Confirmar pago (webhook desde gateway)
router.post("/confirm", async (req, res) => {
  try {
    const { id, fechaPago } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID de pago requerido" });
    }

    // Buscar el pago pendiente
    const [pendingPayments] = await pool.execute(
      'SELECT * FROM pagos_pendientes WHERE pago_id = ? AND estado = "PENDING"',
      [id],
    );

    if (pendingPayments.length === 0) {
      return res.status(404).json({ error: "Pago pendiente no encontrado" });
    }

    const pendingPayment = pendingPayments[0];

    // Verificar estado en el gateway
    try {
      const gatewayResponse = await fetch(
        `${PAYMENT_GATEWAY_URL}/payments/${id}`,
      );
      if (!gatewayResponse.ok) {
        return res
          .status(gatewayResponse.status)
          .json({ error: "Error verificando pago en gateway" });
      }

      const paymentData = await gatewayResponse.json();

      if (paymentData.estado !== "CONFIRMED") {
        return res.status(400).json({ error: "El pago no está confirmado" });
      }

      // Actualizar estado del pago pendiente
      await pool.execute(
        'UPDATE pagos_pendientes SET estado = "CONFIRMED", fecha_confirmacion = NOW() WHERE pago_id = ?',
        [id],
      );

      // Crear la donación
      await pool.execute(
        "INSERT INTO donaciones (proyecto_id, usuario_id, monto, nombre_mostrado, fecha) VALUES (?, ?, ?, ?, NOW())",
        [
          pendingPayment.proyecto_id,
          pendingPayment.usuario_id,
          pendingPayment.monto,
          pendingPayment.nombre_mostrado,
        ],
      );

      // Actualizar monto recaudado del proyecto
      const [sumResult] = await pool.execute(
        "SELECT COALESCE(SUM(monto), 0) as total FROM donaciones WHERE proyecto_id = ?",
        [pendingPayment.proyecto_id],
      );

      // Verificar si se alcanzó la meta o fecha límite
      const [projectData] = await pool.execute(
        "SELECT meta, fecha_limite FROM proyectos WHERE id = ?",
        [pendingPayment.proyecto_id],
      );

      const totalRecaudado = parseFloat(sumResult[0].total);
      const meta = parseFloat(projectData[0].meta);
      const fechaLimite = new Date(projectData[0].fecha_limite);
      const ahora = new Date();

      // Si se alcanzó la meta o pasó la fecha límite, finalizar campaña
      if (totalRecaudado >= meta || ahora >= fechaLimite) {
        await pool.execute(
          'UPDATE proyectos SET campaña_estado = "Finalizada" WHERE id = ?',
          [pendingPayment.proyecto_id],
        );
      }

      res.json({
        message: "Pago confirmado y donación registrada exitosamente",
      });
    } catch (error) {
      console.error("Error verificando pago en gateway:", error);
      return res.status(500).json({ error: "Error verificando pago" });
    }
  } catch (error) {
    console.error("Error confirmando pago:", error);
    res.status(500).json({ error: "Error al confirmar pago" });
  }
});

// Verificar estado de pago
router.get("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar en el gateway
    try {
      const gatewayResponse = await fetch(
        `${PAYMENT_GATEWAY_URL}/payments/${id}`,
      );
      if (!gatewayResponse.ok) {
        return res
          .status(gatewayResponse.status)
          .json({ error: "Error consultando pago en gateway" });
      }

      const paymentData = await gatewayResponse.json();

      // Verificar si ya se procesó en nuestra BD
      const [pendingPayments] = await pool.execute(
        "SELECT * FROM pagos_pendientes WHERE pago_id = ?",
        [id],
      );

      res.json({
        id: paymentData.id,
        estado: paymentData.estado,
        monto: paymentData.monto,
        fechaRegistro: paymentData.fechaRegistro,
        fechaPago: paymentData.fechaPago,
        qr: paymentData.qr || `${PAYMENT_GATEWAY_URL}/payments/qr/${id}`,
        procesado:
          pendingPayments.length > 0 &&
          pendingPayments[0].estado === "CONFIRMED",
      });
    } catch (error) {
      console.error("Error consultando pago en gateway:", error);
      return res.status(500).json({ error: "Error consultando pago" });
    }
  } catch (error) {
    console.error("Error verificando estado de pago:", error);
    res.status(500).json({ error: "Error al verificar estado de pago" });
  }
});

module.exports = router;
