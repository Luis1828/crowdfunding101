function initAuthPages() {
  const register = document.getElementById("registerForm");
  if (register) {
    const nameInput = register.querySelector("#name");
    const emailInput = register.querySelector("#email");
    const passwordInput = register.querySelector("#password");
    const toggleRegisterPassword = document.getElementById(
      "toggleRegisterPassword",
    );

    if (nameInput) {
      nameInput.addEventListener("blur", () =>
        validateField(
          "name",
          nameInput.value.trim() !== "",
          "Nombre requerido",
        ),
      );
      nameInput.addEventListener("input", () => hideError("name"));
    }

    if (emailInput) {
      emailInput.addEventListener("blur", () => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        validateField("email", isValid, "Correo electrónico inválido");
      });
      emailInput.addEventListener("input", () => hideError("email"));
    }

    if (passwordInput) {
      passwordInput.addEventListener("blur", () => {
        const password = passwordInput.value;
        const errors = validatePassword(password);
        const isValid = errors.length === 0;
        validateField("password", isValid, isValid ? "" : errors.join(". "));
      });
      passwordInput.addEventListener("input", () => hideError("password"));
    }

    if (passwordInput && toggleRegisterPassword) {
      toggleRegisterPassword.addEventListener("change", () => {
        passwordInput.type = toggleRegisterPassword.checked
          ? "text"
          : "password";
      });
    }

    register.addEventListener("submit", async function (e) {
      e.preventDefault();
      let isValid = true;

      if (!nameInput.value.trim()) {
        validateField("name", false, "Nombre requerido");
        isValid = false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        validateField("email", false, "Correo electrónico inválido");
        isValid = false;
      }

      // Validación mejorada de contraseña
      const password = passwordInput.value;
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        validateField("password", false, passwordErrors.join(". "));
        isValid = false;
      }

      if (isValid) {
        // Mostrar loading
        const submitBtn = register.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Registrando...";

        try {
          const result = await AuthSystem.register(
            nameInput.value.trim(),
            emailInput.value,
            password,
          );
          if (result.success) {
            const verificationUrl = `verificar-email.html?email=${encodeURIComponent(
              result.pendingEmail || emailInput.value,
            )}`;
            showSuccess(
              result.message ||
                "Registro exitoso. Te enviamos un correo para activar tu cuenta.",
            );
            setTimeout(() => {
              window.location.href = verificationUrl;
            }, 2000);
          } else {
            validateField(
              "email",
              false,
              result.error || "Error en el registro",
            );
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        } catch (error) {
          validateField(
            "email",
            false,
            error.message || "Error en el registro",
          );
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  const login = document.getElementById("loginForm");
  if (login) {
    const emailInput = login.querySelector("#emailLogin");
    const passwordInput = login.querySelector("#passwordLogin");
    const toggleLoginPassword = document.getElementById("toggleLoginPassword");

    if (emailInput) {
      emailInput.addEventListener("blur", () => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        validateField("emailLogin", isValid, "Correo electrónico inválido");
      });
      emailInput.addEventListener("input", () => hideError("emailLogin"));
    }

    if (passwordInput) {
      passwordInput.addEventListener("blur", () => {
        validateField(
          "passwordLogin",
          passwordInput.value.length > 0,
          "Contraseña requerida",
        );
      });
      passwordInput.addEventListener("input", () => hideError("passwordLogin"));
    }

    if (passwordInput && toggleLoginPassword) {
      toggleLoginPassword.addEventListener("change", () => {
        passwordInput.type = toggleLoginPassword.checked
          ? "text"
          : "password";
      });
    }

    login.addEventListener("submit", async function (e) {
      e.preventDefault();
      let isValid = true;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        validateField("emailLogin", false, "Correo electrónico inválido");
        isValid = false;
      }

      if (passwordInput.value.length === 0) {
        validateField("passwordLogin", false, "Contraseña requerida");
        isValid = false;
      }

      if (isValid) {
        // Mostrar loading
        const submitBtn = login.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Iniciando sesión...";

        try {
          const result = await AuthSystem.login(
            emailInput.value,
            passwordInput.value,
          );
          if (result.success) {
            showSuccess("Inicio de sesión exitoso. Redirigiendo...");
            setTimeout(() => {
              const redirectUrl =
                new URLSearchParams(window.location.search).get("redirect") ||
                "index.html";
              window.location.href = redirectUrl;
            }, 1500);
          } else {
            showError("emailLogin", result.error || "Credenciales inválidas");
            showError("passwordLogin", "");
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        } catch (error) {
          showError("emailLogin", error.message || "Error al iniciar sesión");
          showError("passwordLogin", "");
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }
}

function validateField(fieldId, isValid, errorMessage) {
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
      errorEl.textContent = errorMessage;
    }
  }
}

function showError(fieldId, message) {
  const errorEl = document.querySelector(
    `.error-message[data-for="${fieldId}"]`,
  );
  const field = document.getElementById(fieldId);
  if (errorEl) {
    errorEl.style.display = "block";
    errorEl.textContent = message;
  }
  if (field) {
    field.classList.add("error");
    field.classList.remove("success");
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

function validatePassword(password) {
  const errors = [];

  if (password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Debe contener al menos una letra minúscula");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Debe contener al menos una letra mayúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Debe contener al menos un número");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Debe contener al menos un carácter especial (!@#$%^&*...)");
  }

  return errors;
}

function showSuccess(message) {
  let successEl = document.querySelector(".success-message");
  if (!successEl) {
    successEl = document.createElement("div");
    successEl.className = "success-message";
    const container = document.querySelector(
      "main .container, main .form-container",
    );
    if (container) container.prepend(successEl);
  }
  successEl.textContent = message;
  successEl.style.display = "block";
  setTimeout(() => {
    successEl.style.display = "none";
  }, 5000);
}
