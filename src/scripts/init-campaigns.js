const pool = require("../config/database");

async function initCampaigns() {
  console.log("Iniciando campañas de proyectos publicados...");

  const [projects] = await pool.execute(
    `SELECT id, titulo 
     FROM proyectos 
     WHERE estado = 'Publicado' 
     AND campaña_estado = 'No Iniciada'
     AND fecha_limite > NOW()`,
  );

  if (!projects.length) {
    console.log("No hay campañas pendientes de iniciar.");
    return;
  }

  for (const project of projects) {
    await pool.execute(
      'UPDATE proyectos SET campaña_estado = "En Progreso" WHERE id = ?',
      [project.id],
    );
    console.log(`✓ Campaña iniciada para: ${project.titulo}`);
  }

  console.log("Campañas actualizadas.");
}

module.exports = initCampaigns;

if (require.main === module) {
  initCampaigns()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error iniciando campañas:", error.message);
      process.exit(1);
    });
}
