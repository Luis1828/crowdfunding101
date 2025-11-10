const CONFIG = {
  platformName: "CrowdFunding101",
  contactEmail: "info@crowdfunding101.com",
  contactPhone: "+1 (234) 567-890",
  address: "Universidad Nur - Santa Cruz, Santa Cruz de la Sierra, BO"
};

const PROJECT_STATUS = {
  BORRADOR: 'Borrador',
  EN_REVISION: 'En Revisión',
  OBSERVADO: 'Observado',
  RECHAZADO: 'Rechazado',
  PUBLICADO: 'Publicado'
};

const CAMPAIGN_STATUS = {
  NO_INICIADA: 'No Iniciada',
  EN_PROGRESO: 'En Progreso',
  EN_PAUSA: 'En Pausa',
  FINALIZADA: 'Finalizada'
};

const USER_ROLES = {
  VISITANTE: 'visitante',
  USUARIO: 'usuario',
  ADMINISTRADOR: 'administrador'
};

const SAMPLE_DATA = {
  categories: [
    {id:1,name:"Tecnología",icon:"fi fi-rr-laptop",description:"Innovaciones tecnológicas y gadgets"},
    {id:2,name:"Arte",icon:"fi fi-rr-palette",description:"Proyectos creativos y artísticos"},
    {id:3,name:"Cine",icon:"fi fi-rr-film",description:"Películas y documentales"},
    {id:4,name:"Música",icon:"fi fi-rr-music",description:"Álbumes y giras"},
    {id:5,name:"Publicación",icon:"fi fi-rr-book",description:"Libros y revistas"},
    {id:6,name:"Medio Ambiente",icon:"fi fi-rr-leaf",description:"Proyectos sostenibles"}
  ],
  featuredProjects: [
    {id:1,title:"SmartWatch Pro - El reloj del futuro",creator:"María González",category:"Tecnología",image:"assets/images/tech_startup.jpg",goal:20000,raised:15000,backers:184,daysLeft:15,description:"SmartWatch Pro es el reloj inteligente más avanzado.",status:PROJECT_STATUS.PUBLICADO,campaignStatus:CAMPAIGN_STATUS.EN_PROGRESO,creatorId:"user1",observations:"",donations:[
      {name:"Juan Pérez",amount:500,date:"2024-01-15"},
      {name:"Ana Martínez",amount:1000,date:"2024-01-16"},
      {name:"Carlos López",amount:750,date:"2024-01-17"},
      {name:"María García",amount:2000,date:"2024-01-18"},
      {name:"Pedro Sánchez",amount:1500,date:"2024-01-19"},
      {name:"Laura Fernández",amount:3000,date:"2024-01-20"},
      {name:"Roberto Díaz",amount:1250,date:"2024-01-21"},
      {name:"Sofía Morales",amount:5000,date:"2024-01-22"}
    ]},
    {id:2,title:"EcoBottle - Botella reutilizable inteligente",creator:"Carlos Ruiz",category:"Medio Ambiente",image:"assets/images/eco_project.jpg",goal:10000,raised:12500,backers:210,daysLeft:0,description:"Botella de agua que rastrea tu hidratación.",status:PROJECT_STATUS.PUBLICADO,campaignStatus:CAMPAIGN_STATUS.FINALIZADA,creatorId:"user2",observations:"",donations:[
      {name:"Miguel Torres",amount:800,date:"2024-01-10"},
      {name:"Isabel Ramírez",amount:1200,date:"2024-01-11"},
      {name:"Fernando Castro",amount:1500,date:"2024-01-12"},
      {name:"Carmen Vega",amount:2000,date:"2024-01-13"},
      {name:"Andrés Moreno",amount:1000,date:"2024-01-14"},
      {name:"Patricia Ruiz",amount:3000,date:"2024-01-15"},
      {name:"Diego Herrera",amount:3000,date:"2024-01-16"}
    ]},
    {id:3,title:"Arte Abstracto: 'Universo Interior'",creator:"Ana López",category:"Arte",image:"assets/images/art_creative.jpg",goal:10000,raised:4500,backers:67,daysLeft:28,description:"Colección de pinturas abstractas.",status:PROJECT_STATUS.PUBLICADO,campaignStatus:CAMPAIGN_STATUS.EN_PROGRESO,creatorId:"user3",observations:"",donations:[
      {name:"Elena Vargas",amount:500,date:"2024-01-20"},
      {name:"Jorge Mendoza",amount:1000,date:"2024-01-21"},
      {name:"Rosa Jiménez",amount:800,date:"2024-01-22"},
      {name:"Luis Hernández",amount:1200,date:"2024-01-23"},
      {name:"Marta Ortiz",amount:1000,date:"2024-01-24"}
    ]}
  ],
  allProjects: [
    {id:4,title:"Documental: Voces del Amazonas",creator:"Luis Fernández",category:"Cine",image:"assets/images/nuevos/documental-amazonas.jpg",goal:30000,raised:18000,backers:245,daysLeft:42,description:"Documental sobre la riqueza cultural del Amazonas.",status:PROJECT_STATUS.PUBLICADO,campaignStatus:CAMPAIGN_STATUS.EN_PROGRESO,creatorId:"user4",observations:"",donations:[
      {name:"Ricardo Silva",amount:2000,date:"2024-01-05"},
      {name:"Gabriela Rojas",amount:3000,date:"2024-01-06"},
      {name:"Oscar Paredes",amount:2000,date:"2024-01-07"},
      {name:"Verónica Medina",amount:2500,date:"2024-01-08"},
      {name:"Héctor Flores",amount:2000,date:"2024-01-09"},
      {name:"Daniela Cruz",amount:3000,date:"2024-01-10"},
      {name:"Esteban Gómez",amount:3500,date:"2024-01-11"}
    ]},
    {id:5,title:"Álbum: 'Sueños Electrónicos'",creator:"DJ Nova",category:"Música",image:"assets/images/music_campaign.jpg",goal:10000,raised:8500,backers:120,daysLeft:10,description:"Viaje sonoro de paisajes electrónicos.",donations:[
      {name:"Alejandro Campos",amount:600,date:"2024-01-12"},
      {name:"Natalia Espinoza",amount:900,date:"2024-01-13"},
      {name:"Sebastián Peña",amount:1200,date:"2024-01-14"},
      {name:"Valentina Soto",amount:800,date:"2024-01-15"},
      {name:"Felipe Ríos",amount:1500,date:"2024-01-16"},
      {name:"Camila Torres",amount:2000,date:"2024-01-17"},
      {name:"Javier Muñoz",amount:1500,date:"2024-01-18"}
    ]},
    {id:6,title:"Libro: 'Fronteras de la Ciencia'",creator:"Dr. Elena Vargas",category:"Publicación",image:"assets/images/book_publication.jpg",goal:10000,raised:9500,backers:189,daysLeft:5,description:"Exploración de avances en física y AI.",donations:[
      {name:"Adriana León",amount:1000,date:"2024-01-18"},
      {name:"Mauricio Vargas",amount:1500,date:"2024-01-19"},
      {name:"Lucía Salazar",amount:1200,date:"2024-01-20"},
      {name:"Raúl Mendoza",amount:1800,date:"2024-01-21"},
      {name:"Paula Contreras",amount:2000,date:"2024-01-22"},
      {name:"Gonzalo Fuentes",amount:2000,date:"2024-01-23"}
    ]},
    {id:7,title:"HealthApp - Tu salud en tus manos",creator:"Dr. Roberto Méndez",category:"Tecnología",image:"assets/images/nuevos/app-salud.jpg",goal:25000,raised:18200,backers:312,daysLeft:20,description:"Aplicación móvil para monitoreo de salud y bienestar personal con seguimiento de hábitos y recordatorios médicos.",donations:[
      {name:"Carmen López",amount:1500,date:"2024-01-25"},
      {name:"Jorge Hernández",amount:2000,date:"2024-01-26"},
      {name:"Patricia Gómez",amount:1800,date:"2024-01-27"},
      {name:"Fernando Díaz",amount:2200,date:"2024-01-28"},
      {name:"María Ruiz",amount:2500,date:"2024-01-29"},
      {name:"Carlos Vega",amount:3000,date:"2024-01-30"},
      {name:"Laura Torres",amount:2000,date:"2024-02-01"},
      {name:"Roberto Sánchez",amount:3200,date:"2024-02-02"}
    ]},
    {id:8,title:"Colección: 'Expresiones Abstractas'",creator:"Ana Martínez",category:"Arte",image:"assets/images/nuevos/arte-abstracto.jpg",goal:15000,raised:11200,backers:145,daysLeft:35,description:"Serie de obras abstractas que exploran emociones y conceptos universales a través del color y la forma.",donations:[
      {name:"Sofia Ramírez",amount:800,date:"2024-01-20"},
      {name:"Miguel Castro",amount:1200,date:"2024-01-21"},
      {name:"Elena Morales",amount:1500,date:"2024-01-22"},
      {name:"Diego Fernández",amount:1000,date:"2024-01-23"},
      {name:"Isabel Paredes",amount:2000,date:"2024-01-24"},
      {name:"Ricardo Soto",amount:1800,date:"2024-01-25"},
      {name:"Gabriela Moreno",amount:1900,date:"2024-01-26"},
      {name:"Oscar Herrera",amount:1000,date:"2024-01-27"}
    ]},
    {id:9,title:"AquaSmart - Botella inteligente conectada",creator:"Carlos Ruiz",category:"Medio Ambiente",image:"assets/images/nuevos/botella-inteligente.jpg",goal:18000,raised:14500,backers:198,daysLeft:25,description:"Botella reutilizable con tecnología IoT para rastrear hidratación y recordar beber agua.",donations:[
      {name:"Valentina Cruz",amount:1000,date:"2024-01-15"},
      {name:"Sebastián Ortiz",amount:1500,date:"2024-01-16"},
      {name:"Natalia Jiménez",amount:1200,date:"2024-01-17"},
      {name:"Felipe Vargas",amount:2000,date:"2024-01-18"},
      {name:"Camila Silva",amount:1800,date:"2024-01-19"},
      {name:"Javier Rojas",amount:2500,date:"2024-01-20"},
      {name:"Alejandro Medina",amount:1500,date:"2024-01-21"},
      {name:"Daniela Flores",amount:2000,date:"2024-01-22"}
    ]},
    {id:10,title:"MasterClass DJ - Producción Musical Profesional",creator:"DJ Nova",category:"Música",image:"assets/images/nuevos/curso-dj.jpg",goal:12000,raised:9800,backers:156,daysLeft:18,description:"Curso completo de producción musical y técnicas de DJ para principiantes y avanzados.",donations:[
      {name:"Luis Campos",amount:600,date:"2024-01-28"},
      {name:"Rosa Espinoza",amount:800,date:"2024-01-29"},
      {name:"Marta Peña",amount:1200,date:"2024-01-30"},
      {name:"Héctor Soto",amount:1000,date:"2024-01-31"},
      {name:"Verónica Ríos",amount:1500,date:"2024-02-01"},
      {name:"Esteban Torres",amount:1800,date:"2024-02-02"},
      {name:"Adriana Muñoz",amount:1900,date:"2024-02-03"}
    ]},
    {id:11,title:"Amazonas: Voces de la Selva",creator:"Luis Fernández",category:"Cine",image:"assets/images/nuevos/voces-amazonas.jpg",goal:35000,raised:22100,backers:287,daysLeft:45,description:"Documental que muestra la riqueza cultural y natural del Amazonas y las comunidades indígenas.",donations:[
      {name:"Ricardo León",amount:2000,date:"2024-01-10"},
      {name:"Gabriela Vargas",amount:3000,date:"2024-01-11"},
      {name:"Oscar Salazar",amount:2500,date:"2024-01-12"},
      {name:"Verónica Mendoza",amount:2800,date:"2024-01-13"},
      {name:"Héctor Contreras",amount:2200,date:"2024-01-14"},
      {name:"Daniela Fuentes",amount:3100,date:"2024-01-15"},
      {name:"Esteban Campos",amount:2500,date:"2024-01-16"},
      {name:"Adriana Espinoza",amount:2000,date:"2024-01-17"}
    ]},
    {id:12,title:"EcoSpace - Centro comunitario sostenible",creator:"María González",category:"Medio Ambiente",image:"assets/images/nuevos/espacio-ecologico.jpg",goal:40000,raised:28500,backers:423,daysLeft:30,description:"Espacio comunitario ecológico con paneles solares, huertos urbanos y áreas de reciclaje.",donations:[
      {name:"Juan Peña",amount:1500,date:"2024-01-05"},
      {name:"Ana Soto",amount:2000,date:"2024-01-06"},
      {name:"Carlos Ríos",amount:2500,date:"2024-01-07"},
      {name:"María Torres",amount:3000,date:"2024-01-08"},
      {name:"Pedro Muñoz",amount:2000,date:"2024-01-09"},
      {name:"Laura León",amount:3500,date:"2024-01-10"},
      {name:"Roberto Vargas",amount:2800,date:"2024-01-11"},
      {name:"Sofía Salazar",amount:3200,date:"2024-01-12"},
      {name:"Miguel Mendoza",amount:3000,date:"2024-01-13"},
      {name:"Elena Contreras",amount:2000,date:"2024-01-14"}
    ]},
    {id:13,title:"Print3D Pro - Impresora 3D profesional",creator:"Ing. Pablo Rodríguez",category:"Tecnología",image:"assets/images/nuevos/gadget-impresion3d.jpg",goal:22000,raised:16800,backers:234,daysLeft:22,description:"Impresora 3D de alta precisión para uso profesional y educativo con materiales biodegradables.",donations:[
      {name:"Fernando Fuentes",amount:1200,date:"2024-01-18"},
      {name:"Isabel Campos",amount:1800,date:"2024-01-19"},
      {name:"Diego Espinoza",amount:2000,date:"2024-01-20"},
      {name:"Patricia Peña",amount:1500,date:"2024-01-21"},
      {name:"Carmen Soto",amount:2200,date:"2024-01-22"},
      {name:"Andrés Ríos",amount:2500,date:"2024-01-23"},
      {name:"Lucía Torres",amount:1800,date:"2024-01-24"},
      {name:"Raúl Muñoz",amount:1800,date:"2024-01-25"}
    ]},
    {id:14,title:"Estrategia Total - Juego de mesa estratégico",creator:"JuegoLab Studio",category:"Publicación",image:"assets/images/nuevos/juego-de-mesa.jpg",goal:15000,raised:12300,backers:178,daysLeft:28,description:"Juego de mesa estratégico para 2-6 jugadores con mecánicas innovadoras y diseño artístico.",donations:[
      {name:"Paula León",amount:800,date:"2024-01-22"},
      {name:"Gonzalo Vargas",amount:1200,date:"2024-01-23"},
      {name:"Mauricio Salazar",amount:1000,date:"2024-01-24"},
      {name:"Adriana Mendoza",amount:1500,date:"2024-01-25"},
      {name:"Ricardo Contreras",amount:1800,date:"2024-01-26"},
      {name:"Gabriela Fuentes",amount:2000,date:"2024-01-27"},
      {name:"Oscar Campos",amount:1500,date:"2024-01-28"},
      {name:"Verónica Espinoza",amount:1500,date:"2024-01-29"},
      {name:"Héctor Peña",amount:1000,date:"2024-01-30"}
    ]},
    {id:15,title:"Ciencia Avanzada: Guía del Futuro",creator:"Dr. Elena Vargas",category:"Publicación",image:"assets/images/nuevos/libro-cientifico.jpg",goal:14000,raised:11200,backers:167,daysLeft:15,description:"Libro que explora los avances científicos más importantes del siglo XXI y sus implicaciones.",donations:[
      {name:"Daniela Soto",amount:1000,date:"2024-01-26"},
      {name:"Esteban Ríos",amount:1500,date:"2024-01-27"},
      {name:"Adriana Torres",amount:1200,date:"2024-01-28"},
      {name:"Luis Muñoz",amount:1800,date:"2024-01-29"},
      {name:"Rosa León",amount:2000,date:"2024-01-30"},
      {name:"Marta Vargas",amount:1500,date:"2024-02-01"},
      {name:"Héctor Salazar",amount:1200,date:"2024-02-02"},
      {name:"Verónica Mendoza",amount:1000,date:"2024-02-03"}
    ]},
    {id:16,title:"EcoFashion - Moda sostenible y ética",creator:"Diseño Sostenible Co.",category:"Medio Ambiente",image:"assets/images/nuevos/moda-etica.jpg",goal:28000,raised:19500,backers:312,daysLeft:32,description:"Línea de ropa sostenible fabricada con materiales orgánicos y procesos de producción éticos.",donations:[
      {name:"Isabel Contreras",amount:1500,date:"2024-01-12"},
      {name:"Fernando Fuentes",amount:2000,date:"2024-01-13"},
      {name:"Patricia Campos",amount:1800,date:"2024-01-14"},
      {name:"Carmen Espinoza",amount:2200,date:"2024-01-15"},
      {name:"Andrés Peña",amount:2500,date:"2024-01-16"},
      {name:"Lucía Soto",amount:2000,date:"2024-01-17"},
      {name:"Raúl Ríos",amount:1800,date:"2024-01-18"},
      {name:"Paula Torres",amount:2700,date:"2024-01-19"}
    ]},
    {id:17,title:"El Rincón Temático - Restaurante experiencial",creator:"Chef Roberto Méndez",category:"Publicación",image:"assets/images/nuevos/restaurante-tematico.jpg",goal:32000,raised:24100,backers:389,daysLeft:38,description:"Restaurante temático que ofrece experiencias culinarias únicas basadas en diferentes culturas del mundo.",donations:[
      {name:"Gonzalo Muñoz",amount:2000,date:"2024-01-08"},
      {name:"Mauricio León",amount:2500,date:"2024-01-09"},
      {name:"Adriana Vargas",amount:3000,date:"2024-01-10"},
      {name:"Ricardo Salazar",amount:2200,date:"2024-01-11"},
      {name:"Gabriela Mendoza",amount:2800,date:"2024-01-12"},
      {name:"Oscar Contreras",amount:2500,date:"2024-01-13"},
      {name:"Verónica Fuentes",amount:3100,date:"2024-01-14"},
      {name:"Héctor Campos",amount:2000,date:"2024-01-15"},
      {name:"Daniela Espinoza",amount:2000,date:"2024-01-16"}
    ]},
    {id:18,title:"SmartGadget X - Dispositivo inteligente universal",creator:"Tech Innovations",category:"Tecnología",image:"assets/images/nuevos/smart-gadget.jpg",goal:30000,raised:22600,backers:356,daysLeft:27,description:"Gadget inteligente que se conecta con todos tus dispositivos para crear un ecosistema doméstico inteligente.",status:PROJECT_STATUS.PUBLICADO,campaignStatus:CAMPAIGN_STATUS.EN_PROGRESO,creatorId:"user1",observations:"",donations:[
      {name:"Esteban Peña",amount:1800,date:"2024-01-14"},
      {name:"Adriana Soto",amount:2200,date:"2024-01-15"},
      {name:"Luis Ríos",amount:2500,date:"2024-01-16"},
      {name:"Rosa Torres",amount:2000,date:"2024-01-17"},
      {name:"Marta Muñoz",amount:3000,date:"2024-01-18"},
      {name:"Héctor León",amount:2800,date:"2024-01-19"},
      {name:"Verónica Vargas",amount:2200,date:"2024-01-20"},
      {name:"Isabel Salazar",amount:2100,date:"2024-01-21"},
      {name:"Fernando Mendoza",amount:2000,date:"2024-01-22"}
    ]},
    {id:19,title:"Proyecto Nuevo - Esperando Revisión",creator:"María González",category:"Tecnología",image:"assets/images/tech_startup.jpg",goal:15000,raised:0,backers:0,daysLeft:30,description:"Este es un proyecto nuevo que está esperando revisión por parte del administrador.",status:PROJECT_STATUS.EN_REVISION,campaignStatus:CAMPAIGN_STATUS.NO_INICIADA,creatorId:"user1",observations:"",donations:[]},
    {id:20,title:"Proyecto con Observaciones",creator:"Carlos Ruiz",category:"Medio Ambiente",image:"assets/images/eco_project.jpg",goal:20000,raised:0,backers:0,daysLeft:45,description:"Este proyecto necesita algunas correcciones antes de ser publicado.",status:PROJECT_STATUS.OBSERVADO,campaignStatus:CAMPAIGN_STATUS.NO_INICIADA,creatorId:"user2",observations:"Falta información sobre el impacto ambiental. Por favor agregue más detalles sobre los materiales utilizados.",donations:[]},
    {id:21,title:"Proyecto Rechazado",creator:"Ana López",category:"Arte",image:"assets/images/art_creative.jpg",goal:10000,raised:0,backers:0,daysLeft:0,description:"Este proyecto fue rechazado por no cumplir con los lineamientos de la plataforma.",status:PROJECT_STATUS.RECHAZADO,campaignStatus:CAMPAIGN_STATUS.NO_INICIADA,creatorId:"user3",observations:"El proyecto no cumple con los requisitos de contenido apropiado.",donations:[]},
    {id:22,title:"Proyecto en Borrador",creator:"Test User",category:"Música",image:"assets/images/music_campaign.jpg",goal:12000,raised:0,backers:0,daysLeft:60,description:"Este proyecto aún está en borrador y no ha sido enviado para revisión.",status:PROJECT_STATUS.BORRADOR,campaignStatus:CAMPAIGN_STATUS.NO_INICIADA,creatorId:"user4",observations:"",donations:[]}
  ],
  faqs: [
    {question:"¿Cómo puedo crear un proyecto?",answer:"Regístrate, verifica tu correo y crea tu proyecto desde el panel de usuario."},
    {question:"¿Qué tipos de proyectos están permitidos?",answer:"Proyectos creativos e innovadores. No se permiten actividades ilegales o discriminación."},
    {question:"¿Cómo funciona el proceso de financiación?",answer:"Si el proyecto alcanza la meta se entregan los fondos; si no, se devuelven."},
    {question:"¿Qué comisiones cobra la plataforma?",answer:"Comisión de 5% sobre fondos recaudados con cargos por procesamiento."}
  ],
  users: [
    {id:1,name:"Admin User",email:"admin@crowdfunding101.com",password:"admin123",role:USER_ROLES.ADMINISTRADOR,userId:"admin1"},
    {id:2,name:"María González",email:"maria@example.com",password:"user123",role:USER_ROLES.USUARIO,userId:"user1"},
    {id:3,name:"Carlos Ruiz",email:"carlos@example.com",password:"user123",role:USER_ROLES.USUARIO,userId:"user2"},
    {id:4,name:"Ana López",email:"ana@example.com",password:"user123",role:USER_ROLES.USUARIO,userId:"user3"},
    {id:5,name:"Test User",email:"test@test.com",password:"test123",role:USER_ROLES.USUARIO,userId:"user4"}
  ]
};

function ensureProjectStatuses() {
  const allProjects = [...SAMPLE_DATA.featuredProjects, ...SAMPLE_DATA.allProjects];
  allProjects.forEach(project => {
    if(!project.status) {
      if(project.raised >= project.goal) {
        project.status = PROJECT_STATUS.PUBLICADO;
        project.campaignStatus = CAMPAIGN_STATUS.FINALIZADA;
      } else if(project.daysLeft > 0) {
        project.status = PROJECT_STATUS.PUBLICADO;
        project.campaignStatus = CAMPAIGN_STATUS.EN_PROGRESO;
      } else {
        project.status = PROJECT_STATUS.PUBLICADO;
        project.campaignStatus = CAMPAIGN_STATUS.EN_PROGRESO;
      }
    }
    if(!project.campaignStatus) {
      project.campaignStatus = project.daysLeft > 0 ? CAMPAIGN_STATUS.EN_PROGRESO : CAMPAIGN_STATUS.FINALIZADA;
    }
    if(!project.creatorId) {
      const creator = SAMPLE_DATA.users.find(u => u.name === project.creator);
      project.creatorId = creator ? creator.userId : 'user1';
    }
    if(!project.observations) {
      project.observations = '';
    }
  });
}

ensureProjectStatuses();

function formatCurrency(amount){ return new Intl.NumberFormat('es-BO',{style:'currency',currency:'BOB'}).format(amount); }
function calculateProgress(raised,goal){ return Math.min(Math.round((raised/goal)*100),100); }

function getStatusBadgeClass(status) {
  const statusClasses = {
    [PROJECT_STATUS.BORRADOR]: 'badge-gray',
    [PROJECT_STATUS.EN_REVISION]: 'badge-yellow',
    [PROJECT_STATUS.OBSERVADO]: 'badge-orange',
    [PROJECT_STATUS.RECHAZADO]: 'badge-red',
    [PROJECT_STATUS.PUBLICADO]: 'badge-green'
  };
  return statusClasses[status] || 'badge-gray';
}

function getCampaignBadgeClass(status) {
  const statusClasses = {
    [CAMPAIGN_STATUS.NO_INICIADA]: 'badge-gray',
    [CAMPAIGN_STATUS.EN_PROGRESO]: 'badge-blue',
    [CAMPAIGN_STATUS.EN_PAUSA]: 'badge-orange',
    [CAMPAIGN_STATUS.FINALIZADA]: 'badge-green'
  };
  return statusClasses[status] || 'badge-gray';
}

function initMobileMenu(){
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('navMenu');
  if(!btn || !nav) return;
  btn.addEventListener('click', ()=> {
    const expanded = nav.classList.toggle('active');
    btn.setAttribute('aria-expanded', expanded);
  });
  document.querySelectorAll('.nav-menu a').forEach(a=>a.addEventListener('click', ()=>nav.classList.remove('active')));
}

function initFAQ(){
  document.querySelectorAll('.faq-question').forEach(q=>{
    q.addEventListener('click', function(){
      const item = this.parentElement;
      item.classList.toggle('active');
      const icon = this.querySelector('span:last-child');
      if(icon) icon.textContent = item.classList.contains('active')? '−' : '+';
    });
  });
}

function loadFooterData(){
  const email = document.getElementById('footerEmail');
  const phone = document.getElementById('footerPhone');
  const addr1 = document.getElementById('footerAddrLine1');
  const addr2 = document.getElementById('footerAddrLine2');
  if(email){ email.textContent = CONFIG.contactEmail; email.href = `mailto:${CONFIG.contactEmail}`; }
  if(phone){ phone.textContent = CONFIG.contactPhone; phone.href = `tel:${CONFIG.contactPhone.replace(/\D/g,'')}`; }
  if(addr1 && addr2){
    addr1.textContent = 'Universidad Nur - Santa Cruz';
    addr2.textContent = 'Santa Cruz de la Sierra, BO';
  }
  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded', function(){
  ensureProjectStatuses();
  setTimeout(() => {
    initMobileMenu();
  }, 100);
  loadFooterData();
  if(typeof initHomePage === 'function') initHomePage();
  if(typeof initExplorePage === 'function') initExplorePage();
  if(typeof initProjectDetail === 'function') initProjectDetail();
  if(typeof initAuthPages === 'function') initAuthPages();
  if(typeof initAdminPage === 'function') initAdminPage();
  if(typeof initMyProjectsPage === 'function') initMyProjectsPage();
  if(typeof initFavoritesPage === 'function') initFavoritesPage();
  if(typeof initMyContributionsPage === 'function') initMyContributionsPage();
  if(typeof initCreateProjectPage === 'function') initCreateProjectPage();
});
