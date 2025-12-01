async function initFavoritesPage() {
  // Solo usuarios normales pueden tener favoritos
  if (!AuthSystem.isUser()) {
    if (!AuthSystem.isLoggedIn()) {
      window.location.href = "login.html?redirect=favoritos.html";
    } else if (AuthSystem.isAdmin()) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }
    return;
  }

  await loadFavorites();
}

async function loadFavorites() {
  const user = AuthSystem.getCurrentUser();
  if (!user) return;

  const grid = document.getElementById("favoritesGrid");
  const noFavorites = document.getElementById("noFavorites");

  if (grid) grid.innerHTML = "<p>Cargando favoritos...</p>";

  try {
    const favoriteProjects = await window.API.favorites.getMyFavorites();

    if (favoriteProjects.length === 0) {
      if (grid) grid.innerHTML = "";
      if (noFavorites) noFavorites.style.display = "block";
      return;
    }

    if (noFavorites) noFavorites.style.display = "none";
    displayFavorites(favoriteProjects);
  } catch (error) {
    console.error("Error cargando favoritos:", error);
    if (grid)
      grid.innerHTML =
        '<div class="error-message"><p>Error al cargar favoritos. Intenta nuevamente.</p></div>';
  }
}

function displayFavorites(projects) {
  const grid = document.getElementById("favoritesGrid");
  if (!grid) return;

  grid.innerHTML = "";

  projects.forEach((project) => {
    const recaudado = parseFloat(project.recaudado) || 0;
    const meta = parseFloat(project.meta);
    const progress = project.porcentaje || calculateProgress(recaudado, meta);
    const diasRestantes = project.diasRestantes || 0;
    const daysText =
      diasRestantes > 0 ? `${diasRestantes} días restantes` : "Finalizado";

    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <div class="project-image" style="background-image:url('${project.imagen || ""}')"></div>
      <div class="project-content">
        <div class="status-display">
          <span class="badge ${getStatusBadgeClass(project.estado)}">${project.estado}</span>
        </div>
        <h3 class="project-title">${project.titulo}</h3>
        <div class="project-meta">
          <span>Por: ${project.creador_nombre || "Usuario"}</span>
          <span>${project.categoria_nombre || ""}</span>
        </div>
        <div class="progress-bar">
          <div class="progress" style="width:${progress}%;"></div>
        </div>
        <div class="project-stats">
          <div class="project-goal">${formatCurrency(recaudado)} / ${formatCurrency(meta)}</div>
          <div class="project-days">${daysText}</div>
        </div>
        <div class="project-actions">
          <a href="detalle-proyecto.html?id=${project.id}" class="btn btn-primary btn-block">Ver Proyecto</a>
          <button class="btn btn-outline btn-block" onclick="removeFavorite(${project.id})">Quitar de Favoritos</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function removeFavorite(projectId) {
  const user = AuthSystem.getCurrentUser();
  if (!user) return;

  try {
    await window.API.favorites.remove(projectId);
    showSuccess("Proyecto eliminado de favoritos");
    await loadFavorites();
  } catch (error) {
    console.error("Error eliminando favorito:", error);
    showError(
      "Error al eliminar de favoritos: " +
        (error.message || "Error desconocido"),
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

if (typeof initFavoritesPage === "function") {
  document.addEventListener("DOMContentLoaded", initFavoritesPage);
}
