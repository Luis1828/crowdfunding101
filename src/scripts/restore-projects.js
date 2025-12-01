const pool = require("../config/database");

// Mapeo de imágenes a proyectos
const projectsData = [
  {
    imagen: "assets/images/nuevos/app-salud.jpg",
    titulo: "App Salud - Monitoreo de Bienestar",
    descripcion:
      "Aplicación móvil innovadora para monitorear tu salud y bienestar. Incluye seguimiento de actividad física, nutrición, sueño y métricas de salud en tiempo real. Conecta con dispositivos wearables y ofrece recomendaciones personalizadas basadas en inteligencia artificial.",
    categoria: "Tecnología",
    meta: 25000.0,
    dias: 30,
  },
  {
    imagen: "assets/images/nuevos/arte-abstracto.jpg",
    titulo: "Arte Abstracto: Universo Interior",
    descripcion:
      "Colección de pinturas abstractas que exploran emociones y conceptos universales. Cada obra representa un viaje introspectivo a través del color, la forma y la textura. Exposición itinerante por galerías de arte contemporáneo.",
    categoria: "Arte",
    meta: 15000.0,
    dias: 45,
  },
  {
    imagen: "assets/images/nuevos/botella-inteligente.jpg",
    titulo: "EcoBottle Pro - Hidratación Inteligente",
    descripcion:
      "Botella de agua reutilizable con tecnología inteligente que rastrea tu hidratación diaria. Incluye recordatorios personalizados, sensor de temperatura y app móvil. Fabricada con materiales 100% reciclables y diseño ergonómico.",
    categoria: "Tecnología",
    meta: 18000.0,
    dias: 35,
  },
  {
    imagen: "assets/images/nuevos/curso-dj.jpg",
    titulo: "Curso de DJ Profesional - Masterclass",
    descripcion:
      "Curso completo de DJ profesional con técnicas avanzadas de mezcla, producción musical y performance en vivo. Incluye software profesional, equipamiento de estudio y certificación internacional. Impartido por DJs reconocidos internacionalmente.",
    categoria: "Música",
    meta: 12000.0,
    dias: 25,
  },
  {
    imagen: "assets/images/nuevos/documental-amazonas.jpg",
    titulo: "Documental: Voces del Amazonas",
    descripcion:
      "Documental cinematográfico sobre la riqueza cultural del Amazonas y las comunidades indígenas. Explora tradiciones ancestrales, biodiversidad única y los desafíos de conservación. Filmación en 4K con equipo profesional.",
    categoria: "Cine",
    meta: 35000.0,
    dias: 60,
  },
  {
    imagen: "assets/images/nuevos/espacio-ecologico.jpg",
    titulo: "Espacio Ecológico - Centro de Sostenibilidad",
    descripcion:
      "Centro comunitario ecológico con huertos urbanos, talleres de reciclaje y educación ambiental. Espacio para eventos sostenibles, mercado de productos locales y punto de encuentro para activistas ambientales.",
    categoria: "Medio Ambiente",
    meta: 40000.0,
    dias: 90,
  },
  {
    imagen: "assets/images/nuevos/gadget-impresion3d.jpg",
    titulo: "Gadget 3D Pro - Impresora 3D Avanzada",
    descripcion:
      "Impresora 3D de alta precisión para uso profesional y educativo. Tecnología de resina y filamento, área de impresión ampliada y software intuitivo. Ideal para prototipado rápido, diseño industrial y educación STEM.",
    categoria: "Tecnología",
    meta: 22000.0,
    dias: 40,
  },
  {
    imagen: "assets/images/nuevos/juego-de-mesa.jpg",
    titulo: "Estrategia Realms - Juego de Mesa Épico",
    descripcion:
      "Juego de mesa estratégico con mecánicas innovadoras, miniaturas detalladas y narrativa inmersiva. Para 2-6 jugadores, partidas de 60-120 minutos. Diseño artístico único y componentes de alta calidad.",
    categoria: "Arte",
    meta: 15000.0,
    dias: 30,
  },
  {
    imagen: "assets/images/nuevos/libro-cientifico.jpg",
    titulo: "Fronteras de la Ciencia - Libro Científico",
    descripcion:
      "Libro que explora los avances más recientes en física cuántica, inteligencia artificial y biotecnología. Escrito por científicos reconocidos, con ilustraciones y gráficos explicativos. Edición limitada con contenido exclusivo.",
    categoria: "Publicación",
    meta: 10000.0,
    dias: 20,
  },
  {
    imagen: "assets/images/nuevos/moda-etica.jpg",
    titulo: "Moda Ética - Colección Sostenible",
    descripcion:
      "Colección de moda sostenible con materiales orgánicos y procesos de producción éticos. Diseños modernos y versátiles que combinan estilo y responsabilidad ambiental. Cada prenda cuenta la historia de su origen sostenible.",
    categoria: "Medio Ambiente",
    meta: 20000.0,
    dias: 50,
  },
  {
    imagen: "assets/images/nuevos/restaurante-tematico.jpg",
    titulo: "Restaurante Temático - Experiencia Culinaria",
    descripcion:
      "Restaurante temático que combina gastronomía de autor con experiencias inmersivas. Menú estacional con ingredientes locales, diseño arquitectónico único y eventos culturales. Espacio para 80 comensales.",
    categoria: "Arte",
    meta: 50000.0,
    dias: 120,
  },
  {
    imagen: "assets/images/nuevos/smart-gadget.jpg",
    titulo: "SmartGadget - Dispositivo Inteligente",
    descripcion:
      "Dispositivo inteligente todo-en-uno que integra múltiples funciones: asistente de voz, control domótico, seguridad del hogar y entretenimiento. Diseño minimalista, fácil instalación y app móvil intuitiva.",
    categoria: "Tecnología",
    meta: 30000.0,
    dias: 45,
  },
  {
    imagen: "assets/images/nuevos/voces-amazonas.jpg",
    titulo: "Voces del Amazonas - Proyecto Cultural",
    descripcion:
      "Proyecto cultural que documenta y preserva las tradiciones orales de las comunidades amazónicas. Incluye grabaciones de audio, traducciones, material educativo y exposición fotográfica itinerante.",
    categoria: "Cine",
    meta: 28000.0,
    dias: 55,
  },
];

async function restoreProjects() {
  console.log("Restaurando proyectos de demostración...");

  const [categories] = await pool.execute("SELECT id, nombre FROM categorias");
  const categoryMap = categories.reduce((map, cat) => {
    map[cat.nombre] = cat.id;
    return map;
  }, {});

  const [users] = await pool.execute(
    'SELECT id FROM usuarios WHERE activado = TRUE AND rol = "usuario" ORDER BY id',
  );

  if (!users.length) {
    console.log("No existen usuarios activados para asignar proyectos.");
    return;
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < projectsData.length; i += 1) {
    const project = projectsData[i];
    const categoriaId = categoryMap[project.categoria];

    if (!categoriaId) {
      skipped += 1;
      continue;
    }

    const creatorId = users[i % users.length].id;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + project.dias);

    const [existing] = await pool.execute(
      "SELECT id FROM proyectos WHERE imagen = ?",
      [project.imagen],
    );

    if (existing.length) {
      await pool.execute(
        `UPDATE proyectos 
         SET titulo = ?, descripcion = ?, categoria_id = ?, meta = ?, fecha_limite = ?, 
             estado = 'Publicado', campaña_estado = 'En Progreso'
         WHERE imagen = ?`,
        [
          project.titulo,
          project.descripcion,
          categoriaId,
          project.meta,
          fechaLimite,
          project.imagen,
        ],
      );
      updated += 1;
    } else {
      await pool.execute(
        `INSERT INTO proyectos (titulo, descripcion, categoria_id, meta, fecha_limite, imagen, 
                               creador_id, estado, campaña_estado, fecha_creacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Publicado', 'En Progreso', NOW())`,
        [
          project.titulo,
          project.descripcion,
          categoriaId,
          project.meta,
          fechaLimite,
          project.imagen,
          creatorId,
        ],
      );
      created += 1;
    }
  }

  console.log(
    `Proyectos creados: ${created}, actualizados: ${updated}, omitidos: ${skipped}.`,
  );
}

module.exports = restoreProjects;

if (require.main === module) {
  restoreProjects()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error restaurando proyectos:", error.message);
      process.exit(1);
    });
}
