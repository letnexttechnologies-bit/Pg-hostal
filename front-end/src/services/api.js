// src/services/api.js

// ===============================
// BASE CONFIG
// ===============================
const BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://pg-hostal.onrender.com";

const API_BASE_URL = `${BASE_URL}/api`;

// ===============================
// HELPER: Get Token from Storage
// ===============================
const getToken = () => {
  // Check all possible storage locations
  let token = sessionStorage.getItem("token");
  if (!token) token = localStorage.getItem("token");
  if (!token) token = sessionStorage.getItem("authToken");
  if (!token) token = localStorage.getItem("authToken");
  
  if (token) {
    console.log('✅ Token found:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ No token found in any storage');
  }
  
  return token;
};

// ===============================
// HELPER: Dispatch Auth Events
// ===============================
const dispatchAuthEvent = () => {
  console.log('🔔 Dispatching auth state change event');
  const event = new CustomEvent('authStateChanged', {
    detail: { timestamp: Date.now() }
  });
  window.dispatchEvent(event);
  window.dispatchEvent(new Event('storage'));
};

// ===============================
// GENERIC FETCH WRAPPER
// ===============================
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Get token - THIS IS CRITICAL
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log(`🔐 ${options.method || 'GET'} ${endpoint} - WITH auth token`);
  } else {
    console.log(`📤 ${options.method || 'GET'} ${endpoint} - WITHOUT auth token`);
  }

  try {
    console.log(`📡 Fetching: ${url}`);
    console.log(`📋 Headers:`, { ...headers, Authorization: headers.Authorization ? 'Bearer [HIDDEN]' : 'none' });
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`📥 Response: ${response.status} ${response.statusText}`);

    const contentType = response.headers.get("content-type");

    // Handle non-JSON responses
    if (!contentType || !contentType.includes("application/json")) {
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      throw new Error("Server returned non-JSON response");
    }

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Error from ${endpoint}:`, data);
      
      // Handle specific error cases
      if (response.status === 401) {
        console.error('🔒 Unauthorized - Token may be invalid or missing');
        throw new Error("Unauthorized - Invalid or expired token");
      }
      if (response.status === 403) {
        throw new Error("Forbidden - Access denied");
      }
      throw new Error(
        data.message || data.error || `HTTP Error ${response.status}`
      );
    }

    console.log(`✅ Success from ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ Error in fetchAPI for ${endpoint}:`, error.message);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Cannot connect to server. Is the backend running?");
    }
    throw error;
  }
};

// ===============================
// AUTH API
// ===============================
export const authAPI = {
  login: async (credentials) => {
    console.log('🔐 [LOGIN] Starting login process for:', credentials.email);
    
    const response = await fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    
    console.log('📦 [LOGIN] Response received:', { 
      hasToken: !!response.token, 
      hasUser: !!response.user,
      userName: response.user?.name 
    });
    
    if (response.token && response.user) {
      console.log('💾 [LOGIN] Storing token and user in storage');
      
      // Store in BOTH storages with key "token"
      sessionStorage.setItem("token", response.token);
      localStorage.setItem("token", response.token);
      
      const userStr = JSON.stringify(response.user);
      sessionStorage.setItem("user", userStr);
      localStorage.setItem("user", userStr);
      
      console.log('✅ [LOGIN] Stored in sessionStorage:', {
        token: !!sessionStorage.getItem("token"),
        user: !!sessionStorage.getItem("user")
      });
      
      console.log('✅ [LOGIN] Stored in localStorage:', {
        token: !!localStorage.getItem("token"),
        user: !!localStorage.getItem("user")
      });
      
      // Verify immediately
      const verifyToken = getToken();
      console.log('🔍 [LOGIN] Immediate verification - token exists:', !!verifyToken);
      
      // Dispatch event
      dispatchAuthEvent();
      
      console.log('✅ [LOGIN] Login complete, event dispatched');
    } else {
      console.error('❌ [LOGIN] Response missing token or user');
    }
    
    return response;
  },

  register: async (userData) => {
    console.log('📝 [REGISTER] Starting registration');
    
    const response = await fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    
    console.log('✅ [REGISTER] Registration response received');
    
    // If backend returns token (auto-login), store it
    if (response.token && response.user) {
      console.log('💾 [REGISTER] Auto-login: storing token and user');
      
      sessionStorage.setItem("token", response.token);
      localStorage.setItem("token", response.token);
      
      const userStr = JSON.stringify(response.user);
      sessionStorage.setItem("user", userStr);
      localStorage.setItem("user", userStr);
      
      dispatchAuthEvent();
    }
    
    return response;
  },

  changePassword: (passwordData) =>
    fetchAPI("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    }),

  logout: () => {
    console.log('🚪 [LOGOUT] Clearing all storage');
    
    // Clear everything
    sessionStorage.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
    
    console.log('✅ [LOGOUT] Storage cleared');
    
    // Dispatch event
    dispatchAuthEvent();
  },

  isLoggedIn: () => {
    const token = getToken();
    const isLoggedIn = !!token;
    console.log('🔍 [CHECK] isLoggedIn:', isLoggedIn);
    return isLoggedIn;
  },

  getCurrentUser: () => {
    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
    try {
      const user = userStr ? JSON.parse(userStr) : null;
      console.log('👤 [CHECK] getCurrentUser:', user?.name || 'null');
      return user;
    } catch (error) {
      console.error("❌ Error parsing user data:", error);
      return null;
    }
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

  getCurrentUserProfile: () => fetchAPI("/users/me"),

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
    fetchAPI(`/pgs${query ? `?search=${encodeURIComponent(query)}` : ""}`),

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
  getWishlist: () => {
    console.log('📋 [WISHLIST] Getting wishlist');
    console.log('🔑 [WISHLIST] Token check before request:', !!getToken());
    return fetchAPI("/wishlist");
  },

  addToWishlist: (pgId) => {
    console.log('➕ [WISHLIST] Adding PG to wishlist:', pgId);
    return fetchAPI("/wishlist", {
      method: "POST",
      body: JSON.stringify({ pgId }),
    });
  },

  removeFromWishlist: (pgId) => {
    console.log('➖ [WISHLIST] Removing PG from wishlist:', pgId);
    return fetchAPI(`/wishlist/${pgId}`, {
      method: "DELETE",
    });
  },
};

// ===============================
// PROFILE API
// ===============================
export const profileAPI = {
  getProfile: (userId) => fetchAPI(`/profile/users/${userId}`),

  updateProfile: (userId, profileData) =>
    fetchAPI(`/profile/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
};

// ===============================
// EXPORT
// ===============================
export default fetchAPI;

// Make authAPI available globally for debugging
if (typeof window !== 'undefined') {
  window.authAPI = authAPI;
  window.getToken = getToken;
}