const AuthSystem = {
  init() {
    this.loadSession();
    this.updateNavigation();
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  getCurrentRole() {
    const user = this.getCurrentUser();
    return user ? user.role : USER_ROLES.VISITANTE;
  },

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  isAdmin() {
    return this.getCurrentRole() === USER_ROLES.ADMINISTRADOR;
  },

  isUser() {
    return this.getCurrentRole() === USER_ROLES.USUARIO;
  },

  login(email, password) {
    const user = SAMPLE_DATA.users.find(u => u.email === email && u.password === password);
    if (user) {
      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId
      };
      localStorage.setItem('currentUser', JSON.stringify(sessionUser));
      this.updateNavigation();
      return { success: true, user: sessionUser };
    }
    return { success: false, error: 'Credenciales inválidas' };
  },

  register(name, email, password) {
    const existingUser = SAMPLE_DATA.users.find(u => u.email === email);
    if (existingUser) {
      return { success: false, error: 'El correo electrónico ya está registrado' };
    }

    const newUser = {
      id: SAMPLE_DATA.users.length + 1,
      name: name,
      email: email,
      password: password,
      role: USER_ROLES.USUARIO,
      userId: `user${SAMPLE_DATA.users.length + 1}`
    };

    SAMPLE_DATA.users.push(newUser);

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      userId: newUser.userId
    };
    localStorage.setItem('currentUser', JSON.stringify(sessionUser));
    this.updateNavigation();
    return { success: true, user: sessionUser };
  },

  logout() {
    localStorage.removeItem('currentUser');
    this.updateNavigation();
    window.location.href = 'index.html';
  },

  loadSession() {
    const user = this.getCurrentUser();
    if (user) {
      this.updateNavigation();
    }
  },

  updateNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    const user = this.getCurrentUser();
    let navHTML = '';

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
      
      navHTML += `<li class="user-menu"><a href="#" class="user-name">${user.name}</a></li>`;
      navHTML += '<li><a href="#" id="logoutBtn">Cerrar Sesión</a></li>';
    } else {
      navHTML += '<li><a href="index.html">Inicio</a></li>';
      navHTML += '<li><a href="explorar.html">Explorar Proyectos</a></li>';
      navHTML += '<li><a href="registro.html">Registrarse</a></li>';
      navHTML += '<li><a href="login.html">Iniciar Sesión</a></li>';
    }

    navMenu.innerHTML = navHTML;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if(mobileMenuBtn && typeof initMobileMenu === 'function'){
      initMobileMenu();
    }
  },

  requireAuth(requiredRole = null) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return false;
    }
    if (requiredRole && user.role !== requiredRole) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }
};

document.addEventListener('DOMContentLoaded', function() {
  AuthSystem.init();
});

