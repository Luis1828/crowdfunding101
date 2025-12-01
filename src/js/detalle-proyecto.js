let currentProject = null;
let isFavoriteProject = false;

// Asegurar que las funciones auxiliares estén disponibles
if (typeof formatCurrency === "undefined") {
  window.formatCurrency = function (amount) {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(amount);
  };
}

if (typeof calculateProgress === "undefined") {
  window.calculateProgress = function (raised, goal) {
    return Math.min(Math.round((raised / goal) * 100), 100);
  };
}

async function initProjectDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    window.location.href = "explorar.html";
    return;
  }

  try {
    currentProject = await window.API.projects.get(id);

    const user = AuthSystem.getCurrentUser();
    // Asegurar comparación de tipos numéricos
    const creadorId = parseInt(currentProject.creador_id);
    const userId = user
      ? typeof user.id === "string"
        ? parseInt(user.id)
        : user.id
      : null;
    const isCreator = user && creadorId === userId;
    const isAdmin = AuthSystem.isAdmin();

    console.log("Verificando acceso al proyecto:", {
      proyectoId: id,
      estado: currentProject.estado,
      creadorId: creadorId,
      userId: userId,
      isCreator: isCreator,
      isAdmin: isAdmin,
    });

    // Solo proyectos publicados son visibles públicamente
    // Pero el creador y admin pueden ver proyectos en cualquier estado
    if (currentProject.estado !== "Publicado") {
      if (!user || (!isAdmin && !isCreator)) {
        console.log("Acceso denegado: Usuario no autorizado");
        showError(
          "Este proyecto no está disponible para visualización pública",
        );
        setTimeout(() => (window.location.href = "explorar.html"), 2000);
        return;
      }
    }

    // Verificar si es favorito
    if (user) {
      isFavoriteProject = await window.API.favorites.check(id);
    }

    renderProjectDetail(currentProject);
    setupDonationForm();
  } catch (error) {
    console.error("Error cargando proyecto:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      id: id,
    });
    const container = document.getElementById("projectDetail");
    if (container) {
      const errorMessage = error.message || "Error desconocido";
      container.innerHTML = `
        <div class="error-message" style="padding:24px;background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;color:#721c24;">
          <h3>Error al cargar el proyecto</h3>
          <p>${errorMessage}</p>
          <p style="margin-top:12px;"><a href="explorar.html" class="btn btn-primary">Volver a explorar</a></p>
          ${id ? `<p style="margin-top:8px;font-size:0.9rem;color:#856404;">ID del proyecto: ${id}</p>` : ""}
        </div>
      `;
    }
  }
}

function renderProjectDetail(p) {
  const container = document.getElementById("projectDetail");
  if (!container) return;

  const recaudado = parseFloat(p.recaudado) || 0;
  const meta = parseFloat(p.meta);
  const progress =
    p.porcentaje ||
    (typeof calculateProgress === "function"
      ? calculateProgress(recaudado, meta)
      : Math.min(Math.round((recaudado / meta) * 100), 100));
  const fechaLimite = p.fecha_limite
    ? new Date(p.fecha_limite).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const diasRestantes = p.diasRestantes || 0;

  const sortedDonations =
    p.donaciones && p.donaciones.length > 0
      ? [...p.donaciones].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      : [];

  // Top donadores
  const topDonorsHTML =
    p.topDonadores && p.topDonadores.length > 0
      ? `
    <div class="top-donors-section" style="margin-top:24px;padding-top:24px;border-top:2px solid #e9ecef">
      <h3>Top Donadores</h3>
      <ol style="list-style:decimal;padding-left:20px;">
        ${p.topDonadores
          .map(
            (donor, index) => `
          <li style="margin:12px 0;display:flex;justify-content:space-between;align-items:center;">
            <span><strong>${index + 1}.</strong> ${donor.nombre_mostrado}</span>
            <strong style="color:var(--primary-color);">${formatCurrency(parseFloat(donor.total))}</strong>
          </li>
        `,
          )
          .join("")}
      </ol>
    </div>
  `
      : "";

  const donationsHTML =
    sortedDonations.length > 0
      ? `
    <div class="donations-section">
      <h3>Donaciones Recientes</h3>
      <div class="donations-list">
        ${sortedDonations
          .map(
            (d) => `
          <div class="donation-item">
            <div class="donation-info">
              <span class="donation-name">${d.nombre_mostrado || "Anónimo"}</span>
              <span class="donation-date">${formatDate(d.fecha)}</span>
            </div>
            <div class="donation-amount">${formatCurrency(parseFloat(d.monto))}</div>
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="donations-total">
        <strong>Total: ${formatCurrency(recaudado)}</strong>
        <span class="donations-count">(${sortedDonations.length} ${sortedDonations.length === 1 ? "donación" : "donaciones"})</span>
      </div>
    </div>
  `
      : '<p class="no-donations">Aún no hay donaciones para este proyecto.</p>';

  const user = AuthSystem.getCurrentUser();
  // Asegurar comparación de tipos numéricos
  const creadorId = parseInt(p.creador_id);
  const userId = user
    ? typeof user.id === "string"
      ? parseInt(user.id)
      : user.id
    : null;
  const isCreator = user && creadorId === userId;
  const canEdit =
    user &&
    (isCreator || AuthSystem.isAdmin()) &&
    (p.estado === "Borrador" || p.estado === "Observado");
  const canDonate =
    p.estado === "Publicado" && p.campaña_estado === "En Progreso";

  // Mostrar estado del proyecto si no está publicado (solo para creador/admin)
  const estadoBadge =
    p.estado !== "Publicado" && (isCreator || AuthSystem.isAdmin())
      ? `<div class="status-badge" style="background:#ffc107;color:#000;padding:8px 16px;border-radius:4px;display:inline-block;margin-bottom:16px;">
         <strong>Estado: ${p.estado}</strong>
         ${p.campaña_estado ? `<br><small>Campaña: ${p.campaña_estado}</small>` : ""}
       </div>`
      : "";

  container.innerHTML = `<div class="project-detail">
    ${estadoBadge}
    <div class="project-image" style="background-image:url('${p.imagen || ""}')" role="img" aria-label="${p.titulo}"></div>
    <h2 style="margin-top:14px">${p.titulo}</h2>
    <div class="project-meta"><span>Por: ${p.creador_nombre || "Usuario"}</span><span>${p.categoria_nombre || ""}</span></div>
    <div style="margin-top:10px">${p.descripcion || ""}</div>
    <div class="progress-bar" style="margin-top:12px"><div class="progress" style="width:${progress}%;"></div></div>
    <div class="project-stats" style="display:flex;justify-content:space-between;margin-top:8px">
      <div><strong>${formatCurrency(recaudado)}</strong> recaudado</div>
      <div><strong>${formatCurrency(meta)}</strong> meta</div>
    </div>
    ${fechaLimite ? `<div style="margin-top:8px;color:var(--gray-color);"><strong>Fecha límite:</strong> ${fechaLimite} (${diasRestantes} días restantes)</div>` : ""}
    <div class="project-actions">
      ${canDonate ? `<button class="btn btn-primary" id="donateBtn">Aportar</button>` : ""}
      ${AuthSystem.isLoggedIn() ? `<button class="btn btn-outline" id="favoriteBtn">${isFavoriteProject ? "★ Quitar de Favoritos" : "☆ Agregar a Favoritos"}</button>` : ""}
      <a class="btn btn-outline" href="explorar.html">Volver a explorar</a>
      ${canEdit ? `<a href="editar-proyecto.html?id=${p.id}" class="btn btn-secondary">Editar Proyecto</a>` : ""}
    </div>
    <div class="status-display" style="margin-top:16px;">
      <span class="status-label">Estado del Proyecto:</span>
      <span class="badge ${getStatusBadgeClass(p.estado)}">${p.estado}</span>
      <span class="status-label" style="margin-left:16px;">Estado de la Campaña:</span>
      <span class="badge ${getCampaignBadgeClass(p.campaña_estado)}">${p.campaña_estado}</span>
    </div>
    ${topDonorsHTML}
    ${donationsHTML}
    <div class="donation-form-container" id="donationFormContainer" style="display:none;">
      <h3>Realizar una Donación</h3>
      <form id="donationForm">
        <div class="form-group">
          <label class="form-label" for="donorName">Tu Nombre</label>
          <input type="text" id="donorName" class="form-control" required placeholder="Ingresa tu nombre">
        </div>
        <div class="form-group">
          <label class="form-label" for="donationAmount">Monto a Donar</label>
          <input type="number" id="donationAmount" class="form-control" required min="1" placeholder="Ingresa el monto">
        </div>
        <div class="form-group">
          <label class="form-label" for="donorEmail">Correo Electrónico (opcional)</label>
          <input type="email" id="donorEmail" class="form-control" placeholder="tu@email.com">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Confirmar Donación</button>
          <button type="button" class="btn btn-outline" id="cancelDonationBtn">Cancelar</button>
        </div>
      </form>
    </div>
  </div>`;
}

async function showPaymentQR(paymentData, amount, name) {
  const formContainer = document.getElementById("donationFormContainer");
  if (!formContainer) return;

  // Remover QR anterior si existe
  const existingQR = document.getElementById("paymentQRContainer");
  if (existingQR) {
    existingQR.remove();
  }

  // Mostrar contenedor
  formContainer.style.display = "block";

  const qrContainer = document.createElement("div");
  qrContainer.id = "paymentQRContainer";
  qrContainer.innerHTML = `
    <div style="text-align:center;padding:24px;background:#f8f9fa;border-radius:8px;margin-top:16px;">
      <h3>Escanea el código QR para pagar</h3>
      <p>Monto: <strong>${formatCurrency(amount)}</strong></p>
      <img src="${paymentData.qrUrl}" alt="Código QR de pago" style="max-width:300px;margin:16px auto;display:block;border:2px solid #ddd;padding:8px;background:white;">
      <p style="color:#666;font-size:0.9rem;">Esperando confirmación del pago...</p>
      <div id="paymentStatus" style="margin-top:16px;"></div>
      <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;">
        <button class="btn btn-primary" id="simulatePaymentBtn" style="margin-top:8px;">Simular Confirmación (Prueba)</button>
        <button class="btn btn-outline" id="cancelPaymentBtn" style="margin-top:8px;">Cancelar</button>
      </div>
    </div>
  `;

  formContainer.appendChild(qrContainer);

  // Polling para verificar estado del pago
  const paymentId = paymentData.paymentId;
  let pollInterval = null;

  const checkPaymentStatus = async () => {
    try {
      const status = await window.API.payments.getStatus(paymentId);

      if (status.estado === "CONFIRMED" && status.procesado) {
        if (pollInterval) clearInterval(pollInterval);
        qrContainer.innerHTML = `
          <div style="text-align:center;padding:24px;background:#d4edda;border-radius:8px;margin-top:16px;">
            <h3 style="color:#155724;">¡Pago Confirmado!</h3>
            <p>Gracias ${name} por tu donación de ${formatCurrency(amount)}</p>
            <p style="color:#155724;margin-top:12px;">Tu donación ha sido registrada exitosamente.</p>
            <button class="btn btn-primary" onclick="location.reload()" style="margin-top:16px;">Continuar</button>
          </div>
        `;

        // Recargar proyecto
        setTimeout(async () => {
          currentProject = await window.API.projects.get(currentProject.id);
          isFavoriteProject = await window.API.favorites.check(
            currentProject.id,
          );
          renderProjectDetail(currentProject);
          setupDonationForm();
        }, 1000);
        return true; // Pago confirmado
      } else if (status.estado === "PENDING") {
        // Seguir esperando
        const statusEl = document.getElementById("paymentStatus");
        if (statusEl) {
          statusEl.innerHTML =
            '<p style="color:#856404;">Esperando confirmación...</p>';
        }
        return false; // Aún pendiente
      }
    } catch (error) {
      console.error("Error verificando estado de pago:", error);
      return false;
    }
  };

  // Iniciar polling
  pollInterval = setInterval(async () => {
    const confirmed = await checkPaymentStatus();
    if (confirmed && pollInterval) {
      clearInterval(pollInterval);
    }
  }, 3000); // Verificar cada 3 segundos

  // Botón simular confirmación (solo para desarrollo/pruebas)
  document
    .getElementById("simulatePaymentBtn")
    ?.addEventListener("click", async () => {
      const simulateBtn = document.getElementById("simulatePaymentBtn");
      if (simulateBtn) {
        simulateBtn.disabled = true;
        simulateBtn.textContent = "Confirmando...";
      }

      try {
        // Confirmar pago directamente en el gateway
        const confirmResponse = await fetch(
          `http://localhost:3002/payments/${paymentId}/confirm`,
          {
            method: "POST",
          },
        );

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.error || "Error al confirmar pago");
        }

        // Esperar un momento para que el webhook procese
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Verificar estado inmediatamente
        const confirmed = await checkPaymentStatus();

        if (!confirmed) {
          // Si aún no está confirmado, esperar un poco más
          setTimeout(async () => {
            await checkPaymentStatus();
          }, 2000);
        }

        simulateBtn.textContent = "Confirmado!";
      } catch (error) {
        console.error("Error simulando confirmación:", error);
        const statusEl = document.getElementById("paymentStatus");
        if (statusEl) {
          statusEl.innerHTML = `<p style="color:#dc3545;">Error: ${error.message}</p>`;
        }
        if (simulateBtn) {
          simulateBtn.disabled = false;
          simulateBtn.textContent = "Simular Confirmación (Prueba)";
        }
      }
    });

  // Botón cancelar
  document.getElementById("cancelPaymentBtn")?.addEventListener("click", () => {
    clearInterval(pollInterval);
    qrContainer.remove();
    if (formContainer) formContainer.style.display = "none";
    if (donationForm) donationForm.reset();
  });

  // Limpiar intervalo después de 10 minutos
  setTimeout(() => {
    clearInterval(pollInterval);
  }, 600000);
}

function setupDonationForm() {
  const donateBtn = document.getElementById("donateBtn");
  const formContainer = document.getElementById("donationFormContainer");
  const donationForm = document.getElementById("donationForm");
  const cancelBtn = document.getElementById("cancelDonationBtn");
  const favoriteBtn = document.getElementById("favoriteBtn");

  if (donateBtn) {
    donateBtn.addEventListener("click", () => {
      if (!AuthSystem.isLoggedIn()) {
        window.location.href =
          "login.html?redirect=" + encodeURIComponent(window.location.href);
        return;
      }
      if (
        !currentProject ||
        currentProject.estado !== "Publicado" ||
        currentProject.campaña_estado !== "En Progreso"
      ) {
        showError(
          "Este proyecto no está disponible para donaciones. El proyecto debe estar publicado y la campaña en progreso.",
        );
        return;
      }
      if (formContainer) {
        formContainer.style.display =
          formContainer.style.display === "none" ? "block" : "none";
        if (formContainer.style.display === "block") {
          const user = AuthSystem.getCurrentUser();
          if (user) {
            const donorNameInput = document.getElementById("donorName");
            const donorEmailInput = document.getElementById("donorEmail");
            const resolvedName =
              user.nombre ||
              user.name ||
              (user.email ? user.email.split("@")[0] : "Usuario");
            if (donorNameInput) {
              donorNameInput.value = resolvedName;
            }
            if (donorEmailInput) {
              donorEmailInput.value = user.email || "";
            }
          }
          document.getElementById("donationAmount")?.focus();
        }
      }
    });
  }

  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", async () => {
      await toggleFavorite(currentProject.id);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      if (formContainer) formContainer.style.display = "none";
      if (donationForm) donationForm.reset();
    });
  }

  if (donationForm) {
    let isProcessing = false; // Prevenir múltiples submits

    donationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Prevenir múltiples submits
      if (isProcessing) {
        return;
      }

      const user = AuthSystem.getCurrentUser();
      if (!user) {
        window.location.href =
          "login.html?redirect=" + encodeURIComponent(window.location.href);
        return;
      }

      const donorNameInput = document.getElementById("donorName");
      const nameFromInput = donorNameInput?.value?.trim();
      const fallbackName =
        user.nombre ||
        user.name ||
        (user.email ? user.email.split("@")[0] : "Usuario");
      const name = nameFromInput || fallbackName;
      const amount = parseFloat(
        document.getElementById("donationAmount").value,
      );

      if (!amount || amount <= 0) {
        showError(
          "donationAmount",
          "Por favor ingrese un monto válido mayor a 0",
        );
        return;
      }

      isProcessing = true;

      try {
        const submitBtn = donationForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Creando pago...";

        // Crear pago a través del payment gateway
        const paymentData = await window.API.payments.create(
          amount,
          currentProject.id,
          name,
        );

        // Ocultar formulario y mostrar QR
        if (formContainer) formContainer.style.display = "none";

        // Mostrar QR y esperar confirmación
        showPaymentQR(paymentData, amount, name);

        // Resetear formulario
        donationForm.reset();
        isProcessing = false;
      } catch (error) {
        console.error("Error creando pago:", error);
        showError("donationAmount", error.message || "Error al crear el pago");
        const submitBtn = donationForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Confirmar Donación";
        }
        isProcessing = false;
      }
    });
  }
}

async function toggleFavorite(projectId) {
  const user = AuthSystem.getCurrentUser();
  if (!user) {
    window.location.href =
      "login.html?redirect=" + encodeURIComponent(window.location.href);
    return;
  }

  try {
    if (isFavoriteProject) {
      await window.API.favorites.remove(projectId);
      isFavoriteProject = false;
    } else {
      await window.API.favorites.add(projectId);
      isFavoriteProject = true;
    }

    const favoriteBtn = document.getElementById("favoriteBtn");
    if (favoriteBtn) {
      favoriteBtn.textContent = isFavoriteProject
        ? "★ Quitar de Favoritos"
        : "☆ Agregar a Favoritos";
    }
  } catch (error) {
    console.error("Error actualizando favorito:", error);
    showError("No se pudo actualizar el favorito");
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

function showError(fieldId, message) {
  const errorEl = document.querySelector(
    `.error-message[data-for="${fieldId}"]`,
  );
  if (!errorEl) {
    // Crear elemento de error si no existe
    const field = document.getElementById(fieldId);
    if (field) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.setAttribute("data-for", fieldId);
      errorDiv.textContent = message;
      field.parentElement.appendChild(errorDiv);
    }
  } else {
    errorEl.style.display = "block";
    errorEl.textContent = message;
  }
}

function showSuccess(message) {
  let successEl = document.querySelector(".success-message");
  if (!successEl) {
    successEl = document.createElement("div");
    successEl.className = "success-message";
    const container = document.querySelector(".project-detail, .container");
    if (container) container.insertBefore(successEl, container.firstChild);
  }
  successEl.textContent = message;
  successEl.style.display = "block";
  setTimeout(() => {
    successEl.style.display = "none";
  }, 5000);
}
