let currentProjects = [];
let currentFilter = "all";
let visibleProjects = 6;

async function initExplorePage() {
  await loadCategories();
  await loadProjects();

  const params = new URLSearchParams(window.location.search);
  const categoria = params.get("categoria");
  if (categoria) {
    setActiveFilter(categoria);
  } else {
    setActiveFilter("all");
  }

  setupSearch();
  setupLoadMore();
}

async function loadCategories() {
  try {
    const categories = await window.API.categories.list();
    setupFilters(categories);
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

async function loadProjects(filters = {}) {
  try {
    const isAdmin = AuthSystem.isAdmin();
    if (!isAdmin) {
      filters.estado = "Publicado";
    }
    currentProjects = await window.API.projects.list(filters);
  } catch (error) {
    console.error("Error cargando proyectos:", error);
    currentProjects = [];
  }
}

function setupFilters(categories) {
  const filterOptions = document.getElementById("filterOptions");
  if (!filterOptions) return;
  filterOptions.innerHTML = "";
  const allFilter = document.createElement("button");
  allFilter.className = "filter-btn active";
  allFilter.textContent = "Todos";
  allFilter.dataset.filter = "all";
  allFilter.addEventListener("click", () => setActiveFilter("all"));
  filterOptions.appendChild(allFilter);

  if (categories && categories.length > 0) {
    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.textContent = cat.nombre;
      btn.dataset.filter = cat.nombre;
      btn.addEventListener("click", () => setActiveFilter(cat.nombre));
      filterOptions.appendChild(btn);
    });
  }
}

async function setActiveFilter(filter) {
  currentFilter = filter;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  const el = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
  if (el) el.classList.add("active");

  const filters = {};
  if (!AuthSystem.isAdmin()) {
    filters.estado = "Publicado";
  }
  if (filter !== "all") {
    filters.categoria = filter;
  }

  await loadProjects(filters);
  visibleProjects = 6;
  displayProjects(currentProjects.slice(0, visibleProjects));
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn)
    loadMoreBtn.style.display =
      currentProjects.length > visibleProjects ? "block" : "none";
}

function displayProjects(projects) {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  if (projects.length === 0) {
    grid.innerHTML =
      '<div class="no-projects-message"><p>No se encontraron proyectos con los criterios seleccionados.</p></div>';
    return;
  }
  projects.forEach((p) => {
    const progress =
      p.porcentaje || calculateProgress(p.recaudado || 0, p.meta);
    const fechaLimite = p.fecha_limite
      ? new Date(p.fecha_limite).toLocaleDateString("es-ES")
      : "";
    const daysText =
      p.diasRestantes > 0 ? `${p.diasRestantes} días restantes` : "Finalizado";
    const card = document.createElement("div");
    card.className = "project-card";
    const statusBadge =
      p.estado && AuthSystem.isAdmin()
        ? `<span class="badge ${getStatusBadgeClass(p.estado)} project-status-badge">${p.estado}</span>`
        : "";
    card.innerHTML = `<div class="project-image" style="background-image:url('${p.imagen || ""}')" role="img" aria-label="${p.titulo}">${statusBadge}</div>
      <div class="project-content">
        <h3 class="project-title">${p.titulo}</h3>
        <div class="project-meta">
          <span>Por: ${p.creador_nombre || "Usuario"}</span>
          <span>${p.categoria_nombre || ""}</span>
        </div>
      <div class="progress-bar"><div class="progress" style="width:${progress}%;"></div></div>
        <div class="project-stats">
          <div class="project-goal">${formatCurrency(p.recaudado || 0)} / ${formatCurrency(p.meta)}</div>
          <div class="project-days">${daysText}</div>
        </div>
        <a href="detalle-proyecto.html?id=${p.id}" class="btn btn-primary btn-block">Ver Proyecto</a>
      </div>`;
    grid.appendChild(card);
  });
}

function setupSearch() {
  const form = document.getElementById("searchForm");
  if (!form) return;
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const q = this.querySelector(".search-input").value.trim();
    if (q === "") {
      await setActiveFilter(currentFilter);
      return;
    }

    const filters = { search: q };
    if (!AuthSystem.isAdmin()) {
      filters.estado = "Publicado";
    }

    try {
      const filtered = await window.API.projects.list(filters);
      currentProjects = filtered;
      visibleProjects = 6;
      displayProjects(filtered.slice(0, visibleProjects));
      const loadMoreBtn = document.getElementById("loadMoreBtn");
      if (loadMoreBtn) {
        loadMoreBtn.style.display =
          filtered.length > visibleProjects ? "block" : "none";
        loadMoreBtn.onclick = () => loadMoreProjects(filtered);
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
    }
  });
}

function setupLoadMore() {
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (!loadMoreBtn) return;
  loadMoreBtn.addEventListener("click", () => {
    let projectsToShow = currentProjects;
    if (currentFilter !== "all")
      projectsToShow = currentProjects.filter(
        (p) => p.category === currentFilter,
      );
    loadMoreProjects(projectsToShow);
  });
}

function loadMoreProjects(projects) {
  visibleProjects += 6;
  displayProjects(projects.slice(0, visibleProjects));
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn)
    loadMoreBtn.style.display =
      projects.length > visibleProjects ? "block" : "none";
}
