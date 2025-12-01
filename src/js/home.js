async function initHomePage() {
  await loadCategories();
  await loadFeaturedProjects();
  loadFAQ();
  initFAQ();

  // Configurar botón "Comenzar un Proyecto"
  const startProjectBtn = document.getElementById("startProjectBtn");
  if (startProjectBtn) {
    startProjectBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (
        AuthSystem.isLoggedIn() &&
        (AuthSystem.isUser() || AuthSystem.isAdmin())
      ) {
        window.location.href = "crear-proyecto.html";
      } else {
        window.location.href = "registro.html";
      }
    });
  }
}
async function loadCategories() {
  const grid = document.getElementById("categoriesGrid");
  if (!grid) return;
  grid.innerHTML = "<p>Cargando categorías...</p>";

  try {
    const categories = await window.API.categories.list();
    grid.innerHTML = "";
    categories.forEach((c) => {
      const d = document.createElement("a");
      d.href = `explorar.html?categoria=${encodeURIComponent(c.nombre)}`;
      d.className = "category-card";
      d.innerHTML = `<i class="${c.icono || "fi fi-rr-folder"} category-icon" aria-hidden="true"></i><h3>${c.nombre}</h3><p>${c.descripcion || ""}</p>`;
      grid.appendChild(d);
    });
  } catch (error) {
    console.error("Error cargando categorías:", error);
    grid.innerHTML = "<p>Error al cargar categorías</p>";
  }
}

async function loadFeaturedProjects() {
  const grid = document.getElementById("featuredProjectsGrid");
  if (!grid) return;
  grid.innerHTML = "<p>Cargando proyectos...</p>";

  try {
    const projects = await window.API.projects.list({ limit: 3 });
    grid.innerHTML = "";

    if (projects.length === 0) {
      grid.innerHTML = "<p>No hay proyectos destacados disponibles</p>";
      return;
    }

    projects.forEach((p) => {
      const progress =
        p.porcentaje || calculateProgress(p.recaudado || 0, p.meta);
      const fechaLimite = p.fecha_limite
        ? new Date(p.fecha_limite).toLocaleDateString("es-ES")
        : "";
      const daysText =
        p.diasRestantes > 0
          ? `${p.diasRestantes} días restantes`
          : "Finalizado";
      const card = document.createElement("div");
      card.className = "project-card";
      card.innerHTML = `<div class="project-image" style="background-image:url('${p.imagen || ""}')" role="img" aria-label="${p.titulo}"></div>
      <div class="project-content">
          <h3 class="project-title">${p.titulo}</h3>
          <div class="project-meta"><span>Por: ${p.creador_nombre || "Usuario"}</span><span>${p.categoria_nombre || ""}</span></div>
        <div class="progress-bar"><div class="progress" style="width:${progress}%;"></div></div>
          <div class="project-stats">
            <div class="project-goal">${formatCurrency(p.recaudado || 0)} / ${formatCurrency(p.meta)}</div>
            <div class="project-days">${daysText}</div>
          </div>
        <a href="detalle-proyecto.html?id=${p.id}" class="btn btn-primary btn-block">Ver Proyecto</a>
      </div>`;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando proyectos:", error);
    grid.innerHTML = "<p>Error al cargar proyectos</p>";
  }
}
function loadFAQ() {
  const container = document.getElementById("faqContainer");
  if (!container) return;
  container.innerHTML = "";
  SAMPLE_DATA.faqs.forEach((f) => {
    const item = document.createElement("div");
    item.className = "faq-item";
    item.innerHTML = `<div class="faq-question"><span>${f.question}</span><span>+</span></div><div class="faq-answer"><p>${f.answer}</p></div>`;
    container.appendChild(item);
  });
}
