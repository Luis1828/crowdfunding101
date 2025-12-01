let editingProjectId = null;
let pageInitialized = false;

async function initCreateProjectPage() {
  // Prevenir doble inicialización
  if (pageInitialized) return;
  pageInitialized = true;

  if (!AuthSystem.isUser() && !AuthSystem.isAdmin()) {
    window.location.href = "login.html?redirect=crear-proyecto.html";
    return;
  }

  await loadCategories();
  setupForm();

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (id) {
    editingProjectId = parseInt(id);
    console.log("=== INICIANDO EDICIÓN ===");
    console.log("Editando proyecto ID:", editingProjectId);

    // Cargar proyecto directamente (ya no usamos TinyMCE)
    setTimeout(() => {
      loadProjectForEdit(editingProjectId);
    }, 100);
  }
}

async function loadCategories() {
  const select = document.getElementById("projectCategory");
  if (!select) return;

  try {
    // Limpiar TODAS las opciones existentes
    select.innerHTML = '<option value="">Seleccionar categoría</option>';

    const categories = await window.API.categories.list();
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

async function loadProjectForEdit(projectId) {
  console.log("Cargando proyecto para editar:", projectId); // Debug
  const user = AuthSystem.getCurrentUser();

  if (!user) {
    showError("Debes estar autenticado para editar proyectos");
    setTimeout(() => (window.location.href = "login.html"), 2000);
    return;
  }

  try {
    const project = await window.API.projects.get(projectId);
    console.log("Proyecto cargado:", project); // Debug

    if (!project) {
      showError("Proyecto no encontrado");
      setTimeout(() => (window.location.href = "mis-proyectos.html"), 2000);
      return;
    }

    // Asegurar comparación de tipos numéricos
    const creadorId = parseInt(project.creador_id);
    const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;

    console.log("Verificando permisos de edición:", {
      proyectoId: projectId,
      creadorId: creadorId,
      userId: userId,
      isAdmin: AuthSystem.isAdmin(),
    });

    if (creadorId !== userId && !AuthSystem.isAdmin()) {
      showError("No tienes permiso para editar este proyecto");
      setTimeout(() => (window.location.href = "mis-proyectos.html"), 2000);
      return;
    }

    if (
      project.estado !== "Borrador" &&
      project.estado !== "Observado" &&
      !AuthSystem.isAdmin()
    ) {
      showError("Solo puedes editar proyectos en estado Borrador u Observado");
      setTimeout(() => (window.location.href = "mis-proyectos.html"), 2000);
      return;
    }

    // Llenar campos del formulario
    const titleInput = document.getElementById("projectTitleInput");
    const categorySelect = document.getElementById("projectCategory");
    const goalInput = document.getElementById("projectGoal");
    const imageInput = document.getElementById("projectImage");
    const fechaInput = document.getElementById("projectDateLimit");
    const titleEl = document.getElementById("projectTitle");

    if (titleInput) titleInput.value = project.titulo || "";
    if (categorySelect) categorySelect.value = project.categoria_id || "";
    if (goalInput) goalInput.value = project.meta || "";
    if (imageInput) imageInput.value = project.imagen || "";

    // Fecha límite
    if (fechaInput && project.fecha_limite) {
      const fecha = new Date(project.fecha_limite);
      fechaInput.value = fecha.toISOString().split("T")[0];
    }

    // Cambiar título del formulario
    if (titleEl) {
      titleEl.textContent = "Editar Proyecto";
    }

    // Establecer contenido en textarea
    const textarea = document.getElementById("projectDescription");
    if (textarea) {
      textarea.value = project.descripcion || "";
      console.log("Descripción cargada en textarea"); // Debug
    }

    // Cargar observaciones
    await loadObservations(projectId);

    console.log("Proyecto cargado exitosamente"); // Debug
  } catch (error) {
    console.error("Error cargando proyecto:", error);
    showError(
      "Error al cargar el proyecto: " + (error.message || "Error desconocido"),
    );
    setTimeout(() => (window.location.href = "mis-proyectos.html"), 2000);
  }
}

async function loadObservations(projectId) {
  try {
    const observations = await window.API.projects.getObservations(projectId);
    const container = document.getElementById("observationsContainer");
    if (!container) return;

    if (!observations || observations.length === 0) {
      container.innerHTML = "<p>No hay observaciones para este proyecto.</p>";
      return;
    }

    // Evitar mostrar observaciones duplicadas (mismo admin, texto y fecha)
    const seen = new Set();
    const uniqueObservations = [];

    observations.forEach((obs) => {
      const adminId = obs.administrador_id || "";
      const fechaFormateada = formatDate(obs.fecha);
      const texto = (obs.texto || "").trim();
      const key = `${adminId}-${fechaFormateada}-${texto}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueObservations.push(obs);
      }
    });

    container.innerHTML = `
      <h3>Historial de Observaciones</h3>
      <div class="observations-list">
        ${uniqueObservations
          .map(
            (obs) => `
          <div class="observation-item" style="background:#fff3cd;padding:12px;border-radius:8px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <strong>${obs.administrador_nombre || "Administrador"}</strong>
              <span style="color:var(--gray-color);font-size:0.9rem;">${formatDate(obs.fecha)}</span>
            </div>
            <p style="margin:0;color:#856404;">${obs.texto}</p>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  } catch (error) {
    console.error("Error cargando observaciones:", error);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

let isSubmitting = false; // Prevenir múltiples submits

function setupForm() {
  const form = document.getElementById("projectForm");
  const submitForReviewBtn = document.getElementById("submitForReview");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;
      await saveProject("Borrador");
      isSubmitting = false;
    });
  }

  if (submitForReviewBtn) {
    submitForReviewBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      if (validateForm()) {
        isSubmitting = true;
        await saveProject("En Revisión");
        isSubmitting = false;
      }
    });
  }

  const inputs = form.querySelectorAll("input, textarea, select");
  inputs.forEach((input) => {
    input.addEventListener("blur", () =>
      validateField(input.id, input.value.trim() !== ""),
    );
    input.addEventListener("input", () => hideError(input.id));
  });
}

function validateForm() {
  let isValid = true;
  const title = document.getElementById("projectTitleInput").value.trim();
  const category = document.getElementById("projectCategory").value;

  // Obtener contenido del textarea
  const description = document
    .getElementById("projectDescription")
    .value.trim();

  const goal = document.getElementById("projectGoal").value;
  const days = document.getElementById("projectDays").value;
  const image = document.getElementById("projectImage").value.trim();

  if (!title) {
    validateField("projectTitleInput", false, "El título es requerido");
    isValid = false;
  }

  if (!category) {
    validateField("projectCategory", false, "La categoría es requerida");
    isValid = false;
  }

  if (!description) {
    validateField("projectDescription", false, "La descripción es requerida");
    isValid = false;
  }

  if (!goal || goal <= 0) {
    validateField("projectGoal", false, "La meta debe ser mayor a 0");
    isValid = false;
  }

  if (!days || days <= 0) {
    validateField("projectDays", false, "Los días deben ser mayor a 0");
    isValid = false;
  }

  if (!image) {
    validateField("projectImage", false, "La imagen es requerida");
    isValid = false;
  }

  return isValid;
}

async function saveProject(status) {
  if (status === "En Revisión" && !validateForm()) {
    isSubmitting = false;
    return;
  }

  const user = AuthSystem.getCurrentUser();
  if (!user) {
    isSubmitting = false;
    return;
  }

  const title = document.getElementById("projectTitleInput").value.trim();
  const categoria_id = parseInt(
    document.getElementById("projectCategory").value,
  );

  // Obtener contenido del textarea
  const description = document
    .getElementById("projectDescription")
    .value.trim();

  const goal = parseFloat(document.getElementById("projectGoal").value);

  // Obtener fecha límite (nuevo campo)
  const fechaInput = document.getElementById("projectDateLimit");
  const fecha_limite = fechaInput ? fechaInput.value : null;

  // Si no hay campo de fecha, calcular desde días (compatibilidad)
  let fechaLimiteFinal = fecha_limite;
  if (!fechaLimiteFinal) {
    const days = parseInt(document.getElementById("projectDays")?.value || 30);
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + days);
    fechaLimiteFinal = fecha.toISOString().split("T")[0];
  }

  const image = document.getElementById("projectImage").value.trim();

  try {
    const submitBtn = document.querySelector(
      '#projectForm button[type="submit"], #submitForReview',
    );
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Guardando...";
    }

    const projectData = {
      titulo: title,
      categoria_id: categoria_id,
      descripcion: description,
      meta: goal,
      fecha_limite: fechaLimiteFinal,
      imagen: image,
    };

    if (editingProjectId) {
      await window.API.projects.update(editingProjectId, projectData);

      if (status === "En Revisión") {
        await window.API.projects.submit(editingProjectId);
      }
      showSuccess("Proyecto actualizado exitosamente. Redirigiendo...");
    } else {
      await window.API.projects.create(projectData);
      showSuccess("Proyecto creado exitosamente. Redirigiendo...");
    }

    setTimeout(() => {
      window.location.href = "mis-proyectos.html";
    }, 1500);
  } catch (error) {
    console.error("Error guardando proyecto:", error);
    showError(error.message || "Error al guardar el proyecto");
    const submitBtn = document.querySelector(
      '#projectForm button[type="submit"], #submitForReview',
    );
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
    isSubmitting = false;
  }
}

function validateField(fieldId, isValid, errorMessage = "") {
  const field = document.getElementById(fieldId);
  const errorEl = document.querySelector(
    `.error-message[data-for="${fieldId}"]`,
  );

  if (field) {
    if (isValid) {
      field.classList.remove("error");
      field.classList.add("success");
    } else {
      field.classList.remove("success");
      field.classList.add("error");
    }
  }

  if (errorEl) {
    if (isValid) {
      errorEl.style.display = "none";
      errorEl.textContent = "";
    } else {
      errorEl.style.display = "block";
      if (errorMessage) errorEl.textContent = errorMessage;
    }
  }
}

function hideError(fieldId) {
  const errorEl = document.querySelector(
    `.error-message[data-for="${fieldId}"]`,
  );
  const field = document.getElementById(fieldId);
  if (errorEl) errorEl.style.display = "none";
  if (field) {
    field.classList.remove("error");
    field.classList.remove("success");
  }
}

function showSuccess(message) {
  let successEl = document.querySelector(".success-message");
  if (!successEl) {
    successEl = document.createElement("div");
    successEl.className = "success-message";
    const container = document.querySelector(".form-container, .container");
    if (container) container.insertBefore(successEl, container.firstChild);
  }
  successEl.textContent = message;
  successEl.style.display = "block";
  setTimeout(() => {
    successEl.style.display = "none";
  }, 3000);
}

if (typeof initCreateProjectPage === "function") {
  document.addEventListener("DOMContentLoaded", initCreateProjectPage);
}
