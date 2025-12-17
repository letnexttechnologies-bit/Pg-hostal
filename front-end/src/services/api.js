// src/services/api.js

// ===============================
// BASE CONFIG
// ===============================
const BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${BASE_URL}/api`;

// ===============================
// GENERIC FETCH WRAPPER
// ===============================
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Token handling
  const token =
    sessionStorage.getItem("token") ||
    localStorage.getItem("authToken");

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type");

    // Non-JSON response handling
    if (!contentType || !contentType.includes("application/json")) {
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      throw new Error("Server returned non-JSON response");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        `HTTP Error ${response.status}`
      );
    }

    return data;
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Backend server is not reachable");
    }
    throw error;
  }
};

// ===============================
// AUTH API
// ===============================
export const authAPI = {
  login: (credentials) =>
    fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  changePassword: (passwordData) =>
    fetchAPI("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    }),

  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
  },

  isLoggedIn: () =>
    !!sessionStorage.getItem("token") ||
    !!localStorage.getItem("authToken"),

  getCurrentUser: () => {
    const user =
      sessionStorage.getItem("user") ||
      localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// ===============================
// USER API
// ===============================
export const userAPI = {
  createUser: (userData) =>
    fetchAPI("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getUsers: () => fetchAPI("/users"),

  getUserById: (id) => fetchAPI(`/users/${id}`),

  updateUser: (id, userData) =>
    fetchAPI(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  deleteUser: (id) =>
    fetchAPI(`/users/${id}`, {
      method: "DELETE",
    }),
};

// ===============================
// PG API
// ===============================
export const pgAPI = {
  getAllPGs: (query = "") =>
    fetchAPI(`/pgs${query ? `?search=${query}` : ""}`),

  getPGById: (id) => fetchAPI(`/pgs/${id}`),

  createPG: (pgData) =>
    fetchAPI("/pgs", {
      method: "POST",
      body: JSON.stringify(pgData),
    }),

  updatePG: (id, pgData) =>
    fetchAPI(`/pgs/${id}`, {
      method: "PUT",
      body: JSON.stringify(pgData),
    }),

  deletePG: (id) =>
    fetchAPI(`/pgs/${id}`, {
      method: "DELETE",
    }),
};

// ===============================
// WISHLIST API
// ===============================
export const wishlistAPI = {
  getWishlist: async () => {
    try {
      return await fetchAPI("/wishlist");
    } catch (error) {
      const user = authAPI.getCurrentUser();
      if (user?.id) {
        return fetchAPI(`/users/${user.id}/wishlist`);
      }
      throw error;
    }
  },

  addToWishlist: async (pgId) => {
    try {
      return await fetchAPI("/wishlist", {
        method: "POST",
        body: JSON.stringify({ pgId }),
      });
    } catch {
      const user = authAPI.getCurrentUser();
      if (user?.id) {
        return fetchAPI(`/users/${user.id}/wishlist`, {
          method: "POST",
          body: JSON.stringify({ pgId }),
        });
      }
      throw new Error("Unable to add to wishlist");
    }
  },

  removeFromWishlist: async (pgId) => {
    try {
      return await fetchAPI(`/wishlist/${pgId}`, {
        method: "DELETE",
      });
    } catch {
      const user = authAPI.getCurrentUser();
      if (user?.id) {
        return fetchAPI(`/users/${user.id}/wishlist/${pgId}`, {
          method: "DELETE",
        });
      }
      throw new Error("Unable to remove from wishlist");
    }
  },
};

// ===============================
// EXPORT
// ===============================
export default fetchAPI;
