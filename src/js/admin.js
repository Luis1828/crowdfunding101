async function initAdminPage() {
  if (!AuthSystem.isAdmin()) {
    window.location.href = "index.html";
    return;
  }

  setupTabs();
  await loadAdminProjects();
  await loadAdminUsers();
  setupReviewModal();
  setupSearch();
}

function setupSearch() {
  const searchInput = document.getElementById("searchProjects");
  if (searchInput) {
    searchInput.addEventListener("input", async () => {
      await loadAdminProjects();
    });
  }
}

function setupTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(`${targetTab}Tab`).classList.add("active");
    });
  });
}

async function loadAdminProjects() {
  const grid = document.getElementById("adminProjectsGrid");
  if (!grid) return;

  const statusFilter = document.getElementById("statusFilter");
  const searchInput = document.getElementById("searchProjects");

  const filterProjects = async () => {
    grid.innerHTML = "<p>Cargando proyectos...</p>";

    try {
      const filters = {};
      const status = statusFilter.value;
      if (status !== "all") {
        filters.estado = status;
      }

      const search = searchInput.value.trim();
      if (search) {
        filters.search = search;
      }

      const projects = await window.API.admin.getProjects(filters);
      displayAdminProjects(projects);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      grid.innerHTML =
        '<div class="error-message"><p>Error al cargar proyectos. Intenta nuevamente.</p></div>';
    }
  };

  statusFilter.addEventListener("change", filterProjects);
  searchInput.addEventListener("input", filterProjects);

  await filterProjects();
}

function displayAdminProjects(projects) {
  const grid = document.getElementById("adminProjectsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (projects.length === 0) {
    grid.innerHTML = "<p>No se encontraron proyectos.</p>";
    return;
  }

  projects.forEach((project) => {
    const descripcion = project.descripcion || "";
    const card = document.createElement("div");
    card.className = "project-card admin-project-card";
    card.innerHTML = `
      <div class="project-image" style="background-image:url('${project.imagen || ""}')"></div>
      <div class="project-content">
        <div class="status-display">
          <span class="status-label">Estado:</span>
          <span class="badge ${getStatusBadgeClass(project.estado)}">${project.estado}</span>
          <span class="badge ${getCampaignBadgeClass(project.campaña_estado)} campaign-status-badge">${formatCampaignStatus(project.campaña_estado)}</span>
        </div>
        <h3 class="project-title">${project.titulo}</h3>
        <div class="project-meta">
          <span>Por: ${project.creador_nombre || "Usuario"}</span>
          <span>${project.categoria_nombre || ""}</span>
        </div>
        <p>${descripcion.substring(0, 100)}${descripcion.length > 100 ? "..." : ""}</p>
        <div class="admin-actions">
          ${
            project.estado === "En Revisión"
              ? `
            <button class="btn btn-primary btn-sm" onclick="openReviewModal(${project.id})">Revisar</button>
          `
              : `
            <button class="btn btn-primary btn-sm" onclick="openReviewModal(${project.id})">Cambiar Estado</button>
          `
          }
          <a href="detalle-proyecto.html?id=${project.id}" class="btn btn-outline btn-sm">Ver Detalles</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function loadAdminUsers() {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;

  const currentUser = AuthSystem.getCurrentUser();
  closeActiveUserMenu();
  tbody.innerHTML = '<tr><td colspan="6">Cargando usuarios...</td></tr>';

  try {
    const users = await window.API.admin.getUsers();
    tbody.innerHTML = "";

    users.forEach((user) => {
      const isAdmin = user.rol === "administrador";
      const canChangeRole = currentUser && currentUser.id !== user.id;

      const isActivated = user.activado !== undefined ? user.activado : true;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.nombre || user.name}</td>
        <td>${user.email}</td>
        <td><span class="badge ${isAdmin ? "badge-blue" : "badge-gray"}">${user.rol}</span></td>
        <td>
          <span class="badge ${isActivated ? "badge-green" : "badge-yellow"}">${isActivated ? "Activado" : "Pendiente"}</span>
        </td>
        <td>
          ${
            canChangeRole
              ? `
            <div class="user-actions">
              <button class="btn btn-outline btn-sm" onclick="editUser(event, ${user.id})">Editar</button>
              <div class="user-action-menu" id="userActions-${user.id}" aria-hidden="true">
                ${!isActivated ? `<button type="button" class="user-action-option" onclick="activateUser(${user.id})">Activar</button>` : ""}
                <button type="button" class="user-action-option" onclick="toggleUserRole(${user.id})">${isAdmin ? "Quitar Admin" : "Hacer Admin"}</button>
                ${!isAdmin ? `<button type="button" class="user-action-option danger" onclick="deleteUser(${user.id})">Eliminar</button>` : ""}
              </div>
            </div>
          `
              : '<span class="text-muted">-</span>'
          }
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    tbody.innerHTML = '<tr><td colspan="6">Error al cargar usuarios</td></tr>';
  }
}

let activeUserMenu = null;
let userMenuOutsideHandler = null;

function editUser(event, userId) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const menu = document.getElementById(`userActions-${userId}`);
  if (!menu) return;

  const isSameMenu = activeUserMenu === menu && menu.classList.contains("open");

  if (isSameMenu) {
    closeActiveUserMenu();
    return;
  }

  closeActiveUserMenu();

  menu.classList.add("open");
  menu.setAttribute("aria-hidden", "false");
  activeUserMenu = menu;
  attachUserMenuOutsideHandler();
}

function attachUserMenuOutsideHandler() {
  if (userMenuOutsideHandler) return;

  userMenuOutsideHandler = (evt) => {
    if (activeUserMenu && !activeUserMenu.contains(evt.target)) {
      closeActiveUserMenu();
    }
  };

  document.addEventListener("click", userMenuOutsideHandler);
}

function detachUserMenuOutsideHandler() {
  if (!activeUserMenu && userMenuOutsideHandler) {
    document.removeEventListener("click", userMenuOutsideHandler);
    userMenuOutsideHandler = null;
  }
}

function closeActiveUserMenu() {
  if (activeUserMenu) {
    activeUserMenu.classList.remove("open");
    activeUserMenu.setAttribute("aria-hidden", "true");
    activeUserMenu = null;
  }
  detachUserMenuOutsideHandler();
}

async function activateUser(userId) {
  closeActiveUserMenu();
  showConfirm("¿Estás seguro de que deseas activar este usuario?", async () => {
    try {
      await window.API.admin.activateUser(userId);
      showSuccess("Usuario activado exitosamente");
      await loadAdminUsers();
    } catch (error) {
      console.error("Error activando usuario:", error);
      showError(
        "Error al activar usuario: " + (error.message || "Error desconocido"),
      );
    }
  });
}

async function deleteUser(userId) {
  closeActiveUserMenu();
  showConfirm(
    "¿Estás seguro de que deseas eliminar este usuario?",
    async () => {
      try {
        await window.API.admin.deleteUser(userId);
        showSuccess("Usuario eliminado exitosamente");
        await loadAdminUsers();
      } catch (error) {
        console.error("Error eliminando usuario:", error);
        showError(
          "Error al eliminar usuario: " +
            (error.message || "Error desconocido"),
        );
      }
    },
  );
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

function setupReviewModal() {
  const modal = document.getElementById("reviewModal");
  const closeBtn = document.querySelector(".modal-close");
  const cancelBtn = document.getElementById("cancelReview");
  const form = document.getElementById("reviewForm");

  // Función para resetear el estado del modal
  const resetModalState = () => {
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Aplicar Cambio";
    }
    if (form) {
      form.reset();
    }
    const observationsField = document.getElementById("reviewObservations");
    if (observationsField) {
      observationsField.removeAttribute("required");
      observationsField.placeholder = "Ingrese observaciones (opcional)";
      observationsField.style.borderColor = "";
    }
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      resetModalState();
      modal.style.display = "none";
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      resetModalState();
      modal.style.display = "none";
    });
  }

  if (form) {
    let isSubmitting = false; // Prevenir doble submit

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      if (isSubmitting) {
        console.log("Submit ya en proceso, ignorando...");
        return;
      }

      const projectId = parseInt(
        document.getElementById("reviewProjectId").value,
      );
      const action = document.getElementById("reviewAction").value;
      const observations = document.getElementById("reviewObservations").value;

      console.log("Procesando acción:", { projectId, action, hasObservations: !!observations.trim() });

      // Validar antes de deshabilitar el botón
      if (!action || action === "") {
        showError("Por favor selecciona una acción");
        return;
      }

      // Validar observaciones antes de procesar
      if ((action === "reject" || action === "observe") && !observations.trim()) {
        const actionName = action === "reject" ? "rechazar" : "observar";
        showError(`Las observaciones son requeridas al ${actionName} un proyecto`);
        // Resaltar el campo
        const obsField = document.getElementById("reviewObservations");
        if (obsField) {
          obsField.style.borderColor = "#dc3545";
          obsField.focus();
          setTimeout(() => {
            obsField.style.borderColor = "";
          }, 3000);
        }
        return;
      }

      isSubmitting = true;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "Aplicar Cambio";
      
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Procesando...";
        }

        if (action === "approve") {
          console.log("Aprobando proyecto:", projectId);
          await window.API.admin.approveProject(projectId);
        } else if (action === "reject") {
          console.log("Rechazando proyecto:", projectId);
          await window.API.admin.rejectProject(projectId, observations);
        } else if (action === "observe") {
          console.log("Observando proyecto:", projectId);
          await window.API.admin.observeProject(projectId, observations);
        } else if (action === "draft") {
          console.log("Marcando como borrador:", projectId);
          await window.API.admin.setDraftProject(projectId);
        } else {
          throw new Error("Acción no reconocida: " + action);
        }

        showSuccess("Acción realizada exitosamente");
        await loadAdminProjects();
        
        // Resetear estado antes de cerrar
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
        
        modal.style.display = "none";
        form.reset();
      } catch (error) {
        console.error("Error procesando acción:", error);
        showError(
          "Error al procesar la acción: " +
            (error.message || "Error desconocido"),
        );
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });

    // Actualizar requerido del campo de observaciones según la acción seleccionada
    const actionSelect = document.getElementById("reviewAction");
    const observationsField = document.getElementById("reviewObservations");
    
    if (actionSelect && observationsField) {
      actionSelect.addEventListener("change", () => {
        const action = actionSelect.value;
        if (action === "reject" || action === "observe") {
          observationsField.setAttribute("required", "required");
          observationsField.placeholder = "Las observaciones son requeridas";
        } else {
          observationsField.removeAttribute("required");
          observationsField.placeholder = "Ingrese observaciones (opcional)";
        }
      });
    }
  }
}

async function openReviewModal(projectId) {
  const modal = document.getElementById("reviewModal");
  const projectIdInput = document.getElementById("reviewProjectId");
  const actionSelect = document.getElementById("reviewAction");
  const form = document.getElementById("reviewForm");

  if (!modal || !projectIdInput || !actionSelect) {
    console.error("Elementos del modal no encontrados");
    return;
  }

  // Resetear estado del modal antes de abrir
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Aplicar Cambio";
  }
  if (form) {
    form.reset();
  }

  try {
    const project = await window.API.projects.get(projectId);
    console.log("Proyecto cargado para modal:", project);

    projectIdInput.value = projectId;
    const observationsField = document.getElementById("reviewObservations");
    if (observationsField) {
      observationsField.value = "";
      observationsField.removeAttribute("required");
      observationsField.placeholder = "Ingrese observaciones (opcional)";
      observationsField.style.borderColor = "";
    }

    // Limpiar y construir opciones dinámicamente
    actionSelect.innerHTML = '<option value="">Seleccionar acción</option>';

    const estado = project.estado || "";
    console.log("Estado del proyecto:", estado);

    // No mostrar "Aprobar" si ya está publicado
    if (estado !== "Publicado") {
      actionSelect.innerHTML +=
        '<option value="approve">Aprobar/Publicar</option>';
      console.log("Opción 'Aprobar' agregada");
    } else {
      console.log("Proyecto ya publicado, no se muestra opción Aprobar");
    }

    // Siempre permitir observar (múltiples veces) y rechazar
    actionSelect.innerHTML += '<option value="observe">Observar</option>';
    actionSelect.innerHTML += '<option value="reject">Rechazar</option>';
    console.log("Opciones 'Observar' y 'Rechazar' agregadas");

    modal.style.display = "block";
  } catch (error) {
    console.error("Error cargando proyecto:", error);
    showError("Error al cargar el proyecto: " + (error.message || "Error desconocido"));
  }
}

async function toggleUserRole(userId) {
  const currentUser = AuthSystem.getCurrentUser();
  if (!currentUser) return;
  closeActiveUserMenu();

  if (currentUser.id === userId) {
    showError("No puedes cambiar tu propio rol");
    return;
  }

  try {
    const users = await window.API.admin.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newRole = user.rol === "administrador" ? "usuario" : "administrador";

    await window.API.admin.updateUser(userId, { rol: newRole });

    showSuccess(`Rol de usuario actualizado a ${newRole}`);
    await loadAdminUsers();
  } catch (error) {
    console.error("Error cambiando rol:", error);
    showError(
      "Error al cambiar el rol: " + (error.message || "Error desconocido"),
    );
  }
}

if (typeof initAdminPage === "function") {
  document.addEventListener("DOMContentLoaded", initAdminPage);
}

