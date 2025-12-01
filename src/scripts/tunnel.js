/* eslint-disable no-console */
const dotenv = require("dotenv");
const localtunnel = require("localtunnel");

dotenv.config();

async function startTunnel(port, label, subdomainEnv) {
  const subdomain = process.env[subdomainEnv];
  try {
    const tunnel = await localtunnel({
      port,
      subdomain: subdomain || undefined,
    });

    console.log(`[Tunnel] ${label} disponible en: ${tunnel.url}`);
    tunnel.on("close", () => {
      console.log(`[Tunnel] ${label} cerrado`);
    });
    return tunnel;
  } catch (error) {
    console.error(
      `[Tunnel] No se pudo abrir el túnel para ${label}. ` +
        "Es posible que localtunnel.me esté caído, bloqueado por el firewall o saturado.",
    );
    console.error(`[Tunnel] Detalle técnico: ${error.message}`);
    console.log(
      `[Tunnel] Puedes seguir usando la app normalmente en http://localhost:${port} dentro de tu red local.`,
    );
    return null;
  }
}

async function main() {
  const appPort = Number(process.env.PORT || 3000);
  const gatewayPort = Number(process.env.PAYMENT_GATEWAY_PORT || 3002);

  console.log("Iniciando túneles seguros para compartir el proyecto...");
  console.log(
    "Mantén este proceso ejecutándose mientras necesites acceso desde dispositivos externos.",
  );

  await startTunnel(
    appPort,
    "App / Frontend (puerto 3000)",
    "APP_TUNNEL_SUBDOMAIN",
  );
  await startTunnel(
    gatewayPort,
    "Payment Gateway (puerto 3002)",
    "GATEWAY_TUNNEL_SUBDOMAIN",
  );
}

main().catch((error) => {
  console.error("No fue posible iniciar los túneles:", error.message);
  process.exit(1);
});

