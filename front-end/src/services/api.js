// src/services/api.js

// Base URL for your backend
const API_BASE_URL = "http://localhost:5000/api";

// Generic fetch wrapper with error handling
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add token to headers if it exists
  const token = sessionStorage.getItem("token");
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, defaultOptions);
    
    const data = await response.json();
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  // Login user
  login: async (credentials) => {
    return fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Register new user
  register: async (userData) => {
    return fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Logout (client-side)
  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!sessionStorage.getItem("token");
  },

  // Get current user
  getCurrentUser: () => {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
};

// User API calls
export const userAPI = {
  // Create a new user
  createUser: async (userData) => {
    return fetchAPI("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Get all users
  getUsers: async () => {
    return fetchAPI("/users", {
      method: "GET",
    });
  },

  // Get user by ID
  getUserById: async (id) => {
    return fetchAPI(`/users/${id}`, {
      method: "GET",
    });
  },

  // Update user
  updateUser: async (id, userData) => {
    return fetchAPI(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  // Delete user
  deleteUser: async (id) => {
    return fetchAPI(`/users/${id}`, {
      method: "DELETE",
    });
  }
};

// PG API calls (you'll need these for your PG listings)
export const pgAPI = {
  // Get all PGs
  getAllPGs: async (query = "") => {
    return fetchAPI(`/pgs?search=${query}`, {
      method: "GET",
    });
  },

  // Get PG by ID
  getPGById: async (id) => {
    return fetchAPI(`/pgs/${id}`, {
      method: "GET",
    });
  },

  // Create new PG (admin)
  createPG: async (pgData) => {
    return fetchAPI("/pgs", {
      method: "POST",
      body: JSON.stringify(pgData),
    });
  },

  // Update PG (admin)
  updatePG: async (id, pgData) => {
    return fetchAPI(`/pgs/${id}`, {
      method: "PUT",
      body: JSON.stringify(pgData),
    });
  },

  // Delete PG (admin)
  deletePG: async (id) => {
    return fetchAPI(`/pgs/${id}`, {
      method: "DELETE",
    });
  }
};

// Wishlist API calls
export const wishlistAPI = {
  // Get user's wishlist
  getWishlist: async () => {
    return fetchAPI("/wishlist", {
      method: "GET",
    });
  },

  // Add to wishlist
  addToWishlist: async (pgId) => {
    return fetchAPI("/wishlist", {
      method: "POST",
      body: JSON.stringify({ pgId }),
    });
  },

  // Remove from wishlist
  removeFromWishlist: async (pgId) => {
    return fetchAPI(`/wishlist/${pgId}`, {
      method: "DELETE",
    });
  }
};

// Export the base fetch function for custom calls
export default fetchAPI;