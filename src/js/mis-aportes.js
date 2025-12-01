async function initMyContributionsPage() {
  if (!AuthSystem.isUser() && !AuthSystem.isAdmin()) {
    window.location.href = "login.html?redirect=mis-aportes.html";
    return;
  }

  await loadMyContributions();
}

async function loadMyContributions() {
  const user = AuthSystem.getCurrentUser();
  if (!user) return;

  const list = document.getElementById("contributionsList");
  if (list) list.innerHTML = "<p>Cargando aportes...</p>";

  try {
    const contributions = await window.API.donations.getMyContributions();
    const summary = await window.API.donations.getSummary();

    console.log("Contribuciones recibidas:", contributions);
    console.log("Resumen recibido:", summary);

    displayContributions(contributions);
    updateSummary(summary);
  } catch (error) {
    console.error("Error cargando aportes:", error);
    if (list)
      list.innerHTML =
        '<div class="error-message"><p>Error al cargar aportes: ' +
        (error.message || "Error desconocido") +
        "</p></div>";
  }
}

function displayContributions(contributions) {
  const list = document.getElementById("contributionsList");
  if (!list) return;

  list.innerHTML = "";

  if (contributions.length === 0) {
    list.innerHTML =
      '<div class="no-projects-message"><p>No has realizado aportes aún.</p><a href="explorar.html" class="btn btn-primary">Explorar Proyectos</a></div>';
    return;
  }

  contributions.forEach((contrib) => {
    const item = document.createElement("div");
    item.className = "contribution-item";
    item.innerHTML = `
      <div class="contribution-project">
        <div class="contribution-image" style="background-image:url('${contrib.proyecto_imagen || contrib.imagen || ""}')"></div>
        <div class="contribution-info">
          <h3><a href="detalle-proyecto.html?id=${contrib.proyecto_id || contrib.id}">${contrib.proyecto_titulo || contrib.titulo || "Proyecto"}</a></h3>
          <p>${contrib.nombre_mostrado ? `Aporté como: ${contrib.nombre_mostrado}` : ""}</p>
          <p>Por: ${contrib.proyecto_creador || contrib.creador_nombre || "Usuario"}</p>
          <span class="contribution-date">${formatDate(contrib.fecha)}</span>
        </div>
      </div>
      <div class="contribution-amount">
        <strong>${formatCurrency(parseFloat(contrib.monto))}</strong>
      </div>
    `;
    list.appendChild(item);
  });
}

function updateSummary(summary) {
  const totalEl = document.getElementById("totalContributed");
  const countEl = document.getElementById("projectsSupported");

  console.log("=== DEBUG SUMMARY ===");
  console.log("Summary recibido:", summary);
  console.log("Tipo de summary:", typeof summary);
  console.log("summary.total:", summary?.total);
  console.log("summary.total_aportado:", summary?.total_aportado);

  // El backend puede devolver 'total' o 'total_aportado'
  const total = parseFloat(summary?.total || summary?.total_aportado || 0);

  console.log("Total calculado:", total);
  console.log("formatCurrency disponible:", typeof formatCurrency);

  if (totalEl) {
    const formatted =
      typeof formatCurrency === "function"
        ? formatCurrency(total)
        : `Bs. ${total.toFixed(2)}`;
    totalEl.textContent = formatted;
    console.log("Total establecido en elemento:", formatted);
  } else {
    console.error("Elemento totalContributed no encontrado");
  }

  if (countEl) {
    countEl.textContent = summary?.proyectos_apoyados || 0;
    console.log("Proyectos apoyados:", summary?.proyectos_apoyados || 0);
  } else {
    console.error("Elemento projectsSupported no encontrado");
  }
  console.log("=== FIN DEBUG ===");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

if (typeof initMyContributionsPage === "function") {
  document.addEventListener("DOMContentLoaded", initMyContributionsPage);
}
