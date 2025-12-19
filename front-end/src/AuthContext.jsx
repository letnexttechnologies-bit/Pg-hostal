import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      console.log('🔍 AuthContext: Checking authentication...');
      const isLoggedIn = authAPI.isLoggedIn();
      
      if (isLoggedIn) {
        const currentUser = authAPI.getCurrentUser();
        setUser(currentUser);
        console.log('✅ AuthContext: User authenticated:', currentUser?.name);
      } else {
        setUser(null);
        console.log('❌ AuthContext: No valid authentication found');
      }
    } catch (error) {
      console.error('❌ AuthContext: Error checking auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, rememberMe = false) => {
    try {
      console.log('🔐 AuthContext: Logging in...', { rememberMe });
      const response = await authAPI.login(credentials);
      
      if (response.token && response.user) {
        console.log('💾 AuthContext: Storing token and user with key "token"');
        
        // ✅ ALWAYS use the key "token" in BOTH storages
        sessionStorage.setItem("token", response.token);
        sessionStorage.setItem("user", JSON.stringify(response.user));
        
        // Also store in localStorage for persistence
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        console.log('✅ Stored in sessionStorage:', {
          token: !!sessionStorage.getItem("token"),
          user: !!sessionStorage.getItem("user")
        });
        console.log('✅ Stored in localStorage:', {
          token: !!localStorage.getItem("token"),
          user: !!localStorage.getItem("user")
        });
        
        setUser(response.user);
        console.log('✅ AuthContext: Login successful, user set:', response.user.name);
        
        // Dispatch auth state change event
        const event = new CustomEvent('authStateChanged', {
          detail: { isAuthenticated: true, user: response.user }
        });
        window.dispatchEvent(event);
      } else {
        console.error('❌ AuthContext: Invalid response from login API');
        throw new Error('Invalid response from server');
      }
      
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 AuthContext: Registering...');
      const response = await authAPI.register(userData);
      
      // Most backends don't auto-login after registration
      // But if yours does, handle it
      if (response.token && response.user) {
        console.log('💾 AuthContext: Auto-login after registration');
        
        // Store with consistent key "token"
        sessionStorage.setItem("token", response.token);
        sessionStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        setUser(response.user);
        console.log('✅ AuthContext: Registration successful with auto-login:', response.user.name);
        
        // Dispatch event
        const event = new CustomEvent('authStateChanged', {
          detail: { isAuthenticated: true, user: response.user }
        });
        window.dispatchEvent(event);
      } else {
        console.log('✅ AuthContext: Registration successful (no auto-login)');
      }
      
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logging out');
    
    // Clear everything
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear legacy keys just in case
    localStorage.removeItem("authToken");
    localStorage.removeItem("loggedIn");
    
    setUser(null);
    console.log('✅ AuthContext: User logged out, storage cleared');
    
    // Dispatch event
    const event = new CustomEvent('authStateChanged', {
      detail: { isAuthenticated: false, user: null }
    });
    window.dispatchEvent(event);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#ffffff'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #d4af37',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};