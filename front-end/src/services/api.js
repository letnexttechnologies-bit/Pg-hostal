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

  // Add token to headers if it exists - check both storages
  const token = sessionStorage.getItem("token") || localStorage.getItem("authToken");
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
    console.log("Token being sent:", token); // Debug log
  } else {
    console.warn("No token found in storage"); // Debug log
  }

  try {
    console.log(`Making ${options.method || 'GET'} request to:`, url); // Debug log
    const response = await fetch(url, defaultOptions);
    
    // Check content type before parsing
    const contentType = response.headers.get("content-type");
    
    // If response is not JSON, handle it differently
    if (!contentType || !contentType.includes("application/json")) {
      if (!response.ok) {
        // If it's an error and not JSON, throw a generic error
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // If successful but not JSON, return the text
      const text = await response.text();
      throw new Error(`Expected JSON but received: ${text.substring(0, 100)}`);
    }
    
    const data = await response.json();
    console.log("Response data:", data); // Debug log
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    // Enhanced error logging
    if (error.message.includes("Failed to fetch")) {
      console.error("API Error: Cannot connect to server. Is the backend running?");
      throw new Error("Cannot connect to server. Please check if the backend is running.");
    }
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
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!sessionStorage.getItem("token") || !!localStorage.getItem("authToken");
  },

  // Get current user
  getCurrentUser: () => {
    const sessionUser = sessionStorage.getItem("user");
    const localUser = localStorage.getItem("user");
    const user = sessionUser || localUser;
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

// PG API calls
export const pgAPI = {
  // Get all PGs
  getAllPGs: async (query = "") => {
    return fetchAPI(`/pgs${query ? `?search=${query}` : ''}`, {
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
    try {
      return await fetchAPI("/wishlist", {
        method: "GET",
      });
    } catch (error) {
      // If wishlist endpoint doesn't exist, try user-based endpoint
      if (error.message.includes("404")) {
        const user = authAPI.getCurrentUser();
        if (user && user.id) {
          return await fetchAPI(`/users/${user.id}/wishlist`, {
            method: "GET",
          });
        }
      }
      throw error;
    }
  },

  // Add to wishlist
  addToWishlist: async (pgId) => {
    try {
      return await fetchAPI("/wishlist", {
        method: "POST",
        body: JSON.stringify({ pgId }),
      });
    } catch (error) {
      // If wishlist endpoint doesn't exist, try user-based endpoint or alternate format
      if (error.message.includes("404")) {
        const user = authAPI.getCurrentUser();
        if (user && user.id) {
          // Try alternate endpoint structure
          try {
            return await fetchAPI(`/users/${user.id}/wishlist`, {
              method: "POST",
              body: JSON.stringify({ pgId }),
            });
          } catch (err) {
            // Try with pgId in URL
            return await fetchAPI(`/wishlist/add/${pgId}`, {
              method: "POST",
            });
          }
        }
      }
      throw error;
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (pgId) => {
    try {
      return await fetchAPI(`/wishlist/${pgId}`, {
        method: "DELETE",
      });
    } catch (error) {
      // If wishlist endpoint doesn't exist, try alternate formats
      if (error.message.includes("404")) {
        const user = authAPI.getCurrentUser();
        if (user && user.id) {
          try {
            return await fetchAPI(`/users/${user.id}/wishlist/${pgId}`, {
              method: "DELETE",
            });
          } catch (err) {
            // Try with remove in URL
            return await fetchAPI(`/wishlist/remove/${pgId}`, {
              method: "DELETE",
            });
          }
        }
      }
      throw error;
    }
  }
};

// Export the base fetch function for custom calls
export default fetchAPI;