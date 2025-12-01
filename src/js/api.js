/**
 * API Client - Módulo para comunicarse con el backend REST API
 */

const API_BASE_URL = window.location.origin + "/api";

/**
 * Función genérica para hacer peticiones a la API
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Debug: verificar token para requests de proyectos
  if (endpoint.includes("/projects/")) {
    console.log("API Request para proyecto:", {
      endpoint,
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      method: options.method || "GET",
    });
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Si la respuesta no es JSON (por ejemplo, error 404 HTML)
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(
        text || `Error ${response.status}: ${response.statusText}`,
      );
    }

    if (!response.ok) {
      // Si hay un error del backend, lanzar excepción con el mensaje
      const errorMessage =
        data.error || data.message || `Error ${response.status}`;
      console.error("API Error Response:", {
        endpoint,
        status: response.status,
        error: errorMessage,
        data: data,
      });
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error("API Error:", {
      endpoint,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * API de Autenticación
 */
const authAPI = {
  register: async (nombre, email, password) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nombre, email, password }),
    });
  },

  login: async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Guardar token y usuario
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
  },

  getCurrentUser: async () => {
    try {
      const user = await apiRequest("/auth/me");
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    } catch (error) {
      authAPI.logout();
      return null;
    }
  },

  activate: async (token) => {
    return apiRequest(`/auth/activate/${token}`, {
      method: "GET",
    });
  },
};

/**
 * API de Proyectos
 */
const projectsAPI = {
  list: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/projects?${params}`);
  },

  get: async (id) => {
    return apiRequest(`/projects/${id}`);
  },

  create: async (projectData) => {
    return apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  },

  update: async (id, projectData) => {
    return apiRequest(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/projects/${id}`, {
      method: "DELETE",
    });
  },

  submit: async (id) => {
    return apiRequest(`/projects/${id}/submit`, {
      method: "POST",
    });
  },

  getMyProjects: async (estado = "all") => {
    const params = estado !== "all" ? `?estado=${estado}` : "";
    return apiRequest(`/projects/user/my-projects${params}`);
  },

  getObservations: async (id) => {
    return apiRequest(`/projects/${id}/observations`);
  },
};

/**
 * API de Donaciones
 */
const donationsAPI = {
  donate: async (projectId, monto, nombre_mostrado) => {
    return apiRequest(`/donations/projects/${projectId}`, {
      method: "POST",
      body: JSON.stringify({ monto, nombre_mostrado }),
    });
  },

  getByProject: async (projectId) => {
    return apiRequest(`/donations/projects/${projectId}`);
  },

  getMyContributions: async () => {
    return apiRequest("/donations/user/my-contributions");
  },

  getSummary: async () => {
    return apiRequest("/donations/user/summary");
  },
};

/**
 * API de Pagos (Payment Gateway)
 */
const paymentsAPI = {
  create: async (monto, proyecto_id, nombre_mostrado) => {
    return apiRequest("/payments/create", {
      method: "POST",
      body: JSON.stringify({ monto, proyecto_id, nombre_mostrado }),
    });
  },

  getStatus: async (paymentId) => {
    return apiRequest(`/payments/${paymentId}/status`);
  },
};

/**
 * API de Favoritos
 */
const favoritesAPI = {
  add: async (projectId) => {
    return apiRequest(`/favorites/${projectId}`, {
      method: "POST",
    });
  },

  remove: async (projectId) => {
    return apiRequest(`/favorites/${projectId}`, {
      method: "DELETE",
    });
  },

  getMyFavorites: async () => {
    return apiRequest("/favorites/user/my-favorites");
  },

  check: async (projectId) => {
    try {
      const data = await apiRequest(`/favorites/${projectId}/check`);
      return data.isFavorite;
    } catch (error) {
      return false;
    }
  },
};

/**
 * API de Campañas
 */
const campaignsAPI = {
  start: async (projectId) => {
    return apiRequest(`/campaigns/${projectId}/start`, {
      method: "POST",
    });
  },

  pause: async (projectId) => {
    return apiRequest(`/campaigns/${projectId}/pause`, {
      method: "POST",
    });
  },

  resume: async (projectId) => {
    return apiRequest(`/campaigns/${projectId}/resume`, {
      method: "POST",
    });
  },
};

/**
 * API de Categorías
 */
const categoriesAPI = {
  list: async () => {
    return apiRequest("/categories");
  },

  get: async (id) => {
    return apiRequest(`/categories/${id}`);
  },
};

/**
 * API de Administración
 */
const adminAPI = {
  getProjects: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/admin/projects?${params}`);
  },

  approveProject: async (projectId) => {
    return apiRequest(`/admin/projects/${projectId}/approve`, {
      method: "POST",
    });
  },

  observeProject: async (projectId, observaciones) => {
    return apiRequest(`/admin/projects/${projectId}/observe`, {
      method: "POST",
      body: JSON.stringify({ observaciones }),
    });
  },

  rejectProject: async (projectId, observaciones) => {
    return apiRequest(`/admin/projects/${projectId}/reject`, {
      method: "POST",
      body: JSON.stringify({ observaciones }),
    });
  },

  getUsers: async () => {
    return apiRequest("/admin/users");
  },

  createAdmin: async (nombre, email, password) => {
    return apiRequest("/admin/users", {
      method: "POST",
      body: JSON.stringify({ nombre, email, password }),
    });
  },

  updateUser: async (userId, userData) => {
    return apiRequest(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (userId) => {
    return apiRequest(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  },

  activateUser: async (userId) => {
    return apiRequest(`/admin/users/${userId}/activate`, {
      method: "POST",
    });
  },
};

// Exportar APIs
window.API = {
  auth: authAPI,
  projects: projectsAPI,
  donations: donationsAPI,
  favorites: favoritesAPI,
  campaigns: campaignsAPI,
  categories: categoriesAPI,
  admin: adminAPI,
  payments: paymentsAPI,
};
