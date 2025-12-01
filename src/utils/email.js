const nodemailer = require("nodemailer");

const DEFAULT_SMTP_USER = "pruebachuflay@gmail.com";
const DEFAULT_SMTP_PASS = "doyjdtinqynbqjvl";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const ACTIVATION_PAGE = "verificar-email.html";

const smtpUser = process.env.SMTP_USER || DEFAULT_SMTP_USER;
const smtpPass = (process.env.SMTP_PASS || DEFAULT_SMTP_PASS).replace(/\s+/g, "");
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

// Enviar email de activación usando Gmail + token único
async function sendActivationEmail(email, token) {
  const activationUrl = `${FRONTEND_URL}/${ACTIVATION_PAGE}?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: `CrowdFunding101 <${smtpUser}>`,
    to: email,
    subject: "Confirma tu correo y activa tu cuenta",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
        <h2 style="color:#0069d9;">¡Hola!</h2>
        <p>Gracias por registrarte en CrowdFunding101. Para activar tu cuenta y comenzar a crear o apoyar proyectos, confirma tu correo haciendo clic en el siguiente botón:</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${activationUrl}" style="background:#0069d9;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;display:inline-block;">
            Verificar correo
          </a>
        </p>
        <p>También puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break:break-all;"><a href="${activationUrl}">${activationUrl}</a></p>
        <p>Si no solicitaste esta cuenta, ignora este correo.</p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #eee;"/>
        <p style="font-size:0.9rem;color:#666;">Este enlace es válido por 24 horas. Una vez confirmes tu correo, podrás iniciar sesión con tus credenciales.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de activación enviado a ${email}`);
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error;
  }
}

module.exports = {
  sendActivationEmail,
};
