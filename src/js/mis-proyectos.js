async function initMyProjectsPage() {
  // Solo usuarios normales pueden ver "Mis Proyectos"
  if (!AuthSystem.isUser()) {
    if (!AuthSystem.isLoggedIn()) {
      window.location.href = "login.html?redirect=mis-proyectos.html";
    } else if (AuthSystem.isAdmin()) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }
    return;
  }

  setupFilters();
  await loadMyProjects();
}

function setupFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      await loadMyProjects(btn.dataset.filter);
    });
  });
}

async function loadMyProjects(statusFilter = "all") {
  const user = AuthSystem.getCurrentUser();
  if (!user) return;

  const grid = document.getElementById("myProjectsGrid");
  if (!grid) return;

  grid.innerHTML = "<p>Cargando proyectos...</p>";

  try {
    const estado = statusFilter !== "all" ? statusFilter : undefined;
    const projects = await window.API.projects.getMyProjects(estado);
    displayMyProjects(projects);
  } catch (error) {
    console.error("Error cargando proyectos:", error);
    grid.innerHTML =
      '<div class="error-message"><p>Error al cargar proyectos. Intenta nuevamente.</p></div>';
  }
}

function displayMyProjects(projects) {
  const grid = document.getElementById("myProjectsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (projects.length === 0) {
    grid.innerHTML =
      '<div class="no-projects-message"><p>No tienes proyectos en este estado.</p><a href="crear-proyecto.html" class="btn btn-primary">Crear Proyecto</a></div>';
    return;
  }

  projects.forEach((project) => {
    const recaudado = parseFloat(project.recaudado) || 0;
    const meta = parseFloat(project.meta);
    const progress = project.porcentaje || calculateProgress(recaudado, meta);
    const diasRestantes = project.diasRestantes || 0;
    const daysText =
      diasRestantes > 0 ? `${diasRestantes} días restantes` : "Finalizado";

    const canEdit =
      project.estado === "Borrador" || project.estado === "Observado";
    const canManageCampaign = project.estado === "Publicado";

    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <div class="project-image" style="background-image:url('${project.imagen || ""}')"></div>
      <div class="project-content">
        <div class="status-display">
          <span class="badge ${getStatusBadgeClass(project.estado)}">${project.estado}</span>
          <span class="badge ${getCampaignBadgeClass(project.campaña_estado)} campaign-status-badge">${formatCampaignStatus(project.campaña_estado)}</span>
        </div>
        <h3 class="project-title">${project.titulo}</h3>
        <div class="project-meta">
          <span>${project.categoria_nombre || ""}</span>
        </div>
        <div class="progress-bar">
          <div class="progress" style="width:${progress}%;"></div>
        </div>
        <div class="project-stats">
          <div class="project-goal">${formatCurrency(recaudado)} / ${formatCurrency(meta)}</div>
          <div class="project-days">${daysText}</div>
        </div>
        <div class="project-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
          <a href="detalle-proyecto.html?id=${project.id}" class="btn btn-primary btn-sm">Ver</a>
          ${canEdit ? `<a href="editar-proyecto.html?id=${project.id}" class="btn btn-outline btn-sm">Editar</a>` : ""}
          <button onclick="deleteProject(${project.id})" class="btn btn-outline btn-sm" style="color:#dc3545;">Eliminar</button>
          ${project.estado === "Publicado" ? `<a href="ver-recaudaciones.html?id=${project.id}" class="btn btn-outline btn-sm">Ver Recaudaciones</a>` : ""}
          ${canManageCampaign ? getCampaignButton(project) : ""}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function getCampaignButton(project) {
  const estado = project.campaña_estado;
  if (estado === "No Iniciada") {
    return `<button onclick="startCampaign(${project.id})" class="btn btn-primary btn-sm">Iniciar Campaña</button>`;
  } else if (estado === "En Progreso") {
    return `<button onclick="pauseCampaign(${project.id})" class="btn btn-outline btn-sm">Pausar Campaña</button>`;
  } else if (estado === "En Pausa") {
    return `<button onclick="resumeCampaign(${project.id})" class="btn btn-primary btn-sm">Reanudar Campaña</button>`;
  }
  return "";
}

async function deleteProject(projectId) {
  showConfirm(
    "¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.",
    async () => {
      try {
        await window.API.projects.delete(projectId);
        showSuccess("Proyecto eliminado exitosamente");
        await loadMyProjects();
      } catch (error) {
        console.error("Error eliminando proyecto:", error);
        showError(
          "Error al eliminar el proyecto: " +
            (error.message || "Error desconocido"),
        );
      }
    },
  );
}

async function startCampaign(projectId) {
  try {
    await window.API.campaigns.start(projectId);
    showSuccess("Campaña iniciada exitosamente");
    await loadMyProjects();
  } catch (error) {
    console.error("Error iniciando campaña:", error);
    showError(
      "Error al iniciar la campaña: " + (error.message || "Error desconocido"),
    );
  }
}

async function pauseCampaign(projectId) {
  try {
    await window.API.campaigns.pause(projectId);
    showSuccess("Campaña pausada exitosamente");
    await loadMyProjects();
  } catch (error) {
    console.error("Error pausando campaña:", error);
    showError(
      "Error al pausar la campaña: " + (error.message || "Error desconocido"),
    );
  }
}

async function resumeCampaign(projectId) {
  try {
    await window.API.campaigns.resume(projectId);
    showSuccess("Campaña reanudada exitosamente");
    await loadMyProjects();
  } catch (error) {
    console.error("Error reanudando campaña:", error);
    showError(
      "Error al reanudar la campaña: " + (error.message || "Error desconocido"),
    );
  }
}

function showSuccess(message) {
  const successEl = document.createElement("div");
  successEl.className = "success-message";
  successEl.textContent = message;
  successEl.style.cssText =
    "position:fixed;top:20px;right:20px;background:#28a745;color:white;padding:12px 24px;border-radius:8px;z-index:10000;";
  document.body.appendChild(successEl);
  setTimeout(() => successEl.remove(), 3000);
}

if (typeof initMyProjectsPage === "function") {
  document.addEventListener("DOMContentLoaded", initMyProjectsPage);
}
