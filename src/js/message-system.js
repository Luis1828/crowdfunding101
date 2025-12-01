/**
 * Sistema de mensajes en HTML (sin alert ni confirm)
 */

// Crear contenedor de mensajes si no existe
function ensureMessageContainer() {
  let container = document.getElementById("messageContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "messageContainer";
    container.style.cssText =
      "position:fixed;top:20px;right:20px;z-index:10000;max-width:400px;";
    document.body.appendChild(container);
  }
  return container;
}

// Mostrar mensaje de éxito
function showSuccess(message, duration = 3000) {
  const container = ensureMessageContainer();
  const messageEl = document.createElement("div");
  messageEl.className = "success-message";
  messageEl.style.cssText =
    "background:#28a745;color:white;padding:12px 24px;border-radius:8px;margin-bottom:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);";
  messageEl.textContent = message;
  container.appendChild(messageEl);

  setTimeout(() => {
    messageEl.style.transition = "opacity 0.3s";
    messageEl.style.opacity = "0";
    setTimeout(() => messageEl.remove(), 300);
  }, duration);
}

// Mostrar mensaje de error
function showError(message, duration = 5000) {
  const container = ensureMessageContainer();
  const messageEl = document.createElement("div");
  messageEl.className = "error-message";
  messageEl.style.cssText =
    "background:#dc3545;color:white;padding:12px 24px;border-radius:8px;margin-bottom:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);";
  messageEl.textContent = message;
  container.appendChild(messageEl);

  setTimeout(() => {
    messageEl.style.transition = "opacity 0.3s";
    messageEl.style.opacity = "0";
    setTimeout(() => messageEl.remove(), 300);
  }, duration);
}

// Mostrar mensaje de información
function showInfo(message, duration = 3000) {
  const container = ensureMessageContainer();
  const messageEl = document.createElement("div");
  messageEl.className = "info-message";
  messageEl.style.cssText =
    "background:#17a2b8;color:white;padding:12px 24px;border-radius:8px;margin-bottom:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);";
  messageEl.textContent = message;
  container.appendChild(messageEl);

  setTimeout(() => {
    messageEl.style.transition = "opacity 0.3s";
    messageEl.style.opacity = "0";
    setTimeout(() => messageEl.remove(), 300);
  }, duration);
}

// Mostrar diálogo de confirmación (reemplazo de confirm())
function showConfirm(message, onConfirm, onCancel = null) {
  // Crear overlay
  const overlay = document.createElement("div");
  overlay.id = "confirmOverlay";
  overlay.style.cssText =
    "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10001;display:flex;align-items:center;justify-content:center;";

  // Crear modal
  const modal = document.createElement("div");
  modal.style.cssText =
    "background:white;padding:24px;border-radius:8px;max-width:400px;width:90%;box-shadow:0 4px 6px rgba(0,0,0,0.1);";
  modal.innerHTML = `
    <h3 style="margin-top:0;margin-bottom:16px;">Confirmar</h3>
    <p style="margin-bottom:24px;">${message}</p>
    <div style="display:flex;gap:12px;justify-content:flex-end;">
      <button id="confirmCancelBtn" class="btn btn-outline" style="padding:8px 16px;">Cancelar</button>
      <button id="confirmOkBtn" class="btn btn-primary" style="padding:8px 16px;">Confirmar</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Event listeners
  const closeModal = () => {
    overlay.style.transition = "opacity 0.3s";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 300);
  };

  document.getElementById("confirmOkBtn").addEventListener("click", () => {
    closeModal();
    if (onConfirm) onConfirm();
  });

  document.getElementById("confirmCancelBtn").addEventListener("click", () => {
    closeModal();
    if (onCancel) onCancel();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal();
      if (onCancel) onCancel();
    }
  });
}

// Exportar funciones globalmente
window.showSuccess = showSuccess;
window.showError = showError;
window.showInfo = showInfo;
window.showConfirm = showConfirm;
