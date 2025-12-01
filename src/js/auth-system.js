const AuthSystem = {
  init() {
    this.loadSession();
    this.updateNavigation();
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  },

  getCurrentRole() {
    const user = this.getCurrentUser();
    if (!user) return USER_ROLES.VISITANTE;
    // Mapear roles del backend
    if (user.rol === "administrador") return USER_ROLES.ADMINISTRADOR;
    if (user.rol === "usuario") return USER_ROLES.USUARIO;
    return USER_ROLES.VISITANTE;
  },

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.rol === "administrador";
  },

  isUser() {
    const user = this.getCurrentUser();
    return user && user.rol === "usuario";
  },

  async login(email, password) {
    try {
      const data = await window.API.auth.login(email, password);
      this.updateNavigation();
      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Credenciales inválidas",
      };
    }
  },

  async register(name, email, password) {
    try {
      const data = await window.API.auth.register(name, email, password);
      return {
        success: true,
        message:
          "Usuario registrado exitosamente. Revisa tu email para activar tu cuenta.",
        pendingEmail: data.pendingEmail || email,
      };
    } catch (error) {
      return { success: false, error: error.message || "Error en el registro" };
    }
  },

  logout() {
    window.API.auth.logout();
    localStorage.removeItem("currentUser");
    this.updateNavigation();
    window.location.href = "index.html";
  },

  async loadSession() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const user = await window.API.auth.getCurrentUser();
        if (user) {
          localStorage.setItem("currentUser", JSON.stringify(user));
          this.updateNavigation();
        }
      } catch (error) {
        // Token inválido, limpiar
        this.logout();
      }
    } else {
      this.updateNavigation();
    }
  },

  updateNavigation() {
    const navMenu = document.querySelector(".nav-menu");
    if (!navMenu) return;

    const user = this.getCurrentUser();
    let navHTML = "";

    if (user) {
      navHTML += '<li><a href="index.html">Inicio</a></li>';
      navHTML += '<li><a href="explorar.html">Explorar Proyectos</a></li>';

      if (this.isAdmin()) {
        navHTML += '<li><a href="admin.html">Admin</a></li>';
      } else {
        navHTML += '<li><a href="mis-proyectos.html">Mis Proyectos</a></li>';
        navHTML += '<li><a href="favoritos.html">Favoritos</a></li>';
        navHTML += '<li><a href="mis-aportes.html">Mis Aportes</a></li>';
      }

      const userName = user.nombre || user.name;
      navHTML += `<li class="user-menu"><a href="#" class="user-name">${userName}</a></li>`;
      navHTML += '<li><a href="#" id="logoutBtn">Cerrar Sesión</a></li>';
    } else {
      navHTML += '<li><a href="index.html">Inicio</a></li>';
      navHTML += '<li><a href="explorar.html">Explorar Proyectos</a></li>';
      navHTML += '<li><a href="registro.html">Registrarse</a></li>';
      navHTML += '<li><a href="login.html">Iniciar Sesión</a></li>';
    }

    navMenu.innerHTML = navHTML;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    if (mobileMenuBtn && typeof initMobileMenu === "function") {
      initMobileMenu();
    }
  },

  requireAuth(requiredRole = null) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = "login.html";
      return false;
    }
    if (requiredRole && user.role !== requiredRole) {
      window.location.href = "index.html";
      return false;
    }
    return true;
  },
};

document.addEventListener("DOMContentLoaded", async function () {
  // Cargar API primero
  if (typeof window.API === "undefined") {
    console.error(
      "API no está disponible. Asegúrate de cargar api.js antes de auth-system.js",
    );
  }
  await AuthSystem.init();
});
