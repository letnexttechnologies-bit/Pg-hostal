import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isLogin) {
      if (!email) newErrors.email = "Email is required";
      else if (!validateEmail(email)) newErrors.email = "Invalid email format";
      if (!password) newErrors.password = "Password is required";
    } else {
      if (!name || name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
      if (!regEmail) newErrors.regEmail = "Email is required";
      else if (!validateEmail(regEmail)) newErrors.regEmail = "Invalid email format";
      if (!regPassword) newErrors.regPassword = "Password is required";
      else if (regPassword.length < 6) newErrors.regPassword = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      console.log('🔐 Attempting login...');
      
      const response = await login({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      console.log("✅ Login successful");
      
      // Store token based on "Remember Me" preference
      if (rememberMe) {
        // Store in localStorage (persists after browser close)
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        console.log('💾 Stored in localStorage (persistent)');
      } else {
        // Store in sessionStorage (clears on browser close)
        sessionStorage.setItem("token", response.token);
        sessionStorage.setItem("user", JSON.stringify(response.user));
        console.log('💾 Stored in sessionStorage (session only)');
      }
      
      // Navigate based on pending action or default to home
      const from = location.state?.from || '/';
      const pendingAction = location.state?.pendingWishlistAction;
      
      if (pendingAction) {
        console.log('📌 Redirecting with pending wishlist action');
        navigate(from, { 
          replace: true,
          state: { pendingWishlistAction: pendingAction } 
        });
      } else {
        console.log('🏠 Redirecting to:', from);
        navigate(from, { replace: true });
      }
      
    } catch (error) {
      console.error("❌ Login error:", error);
      setErrors({ login: error.message || "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      console.log('📝 Attempting registration...');
      
      const response = await register({
        name: name.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword
      });

      console.log("✅ Registration successful");
      
      // Store in sessionStorage by default after registration
      sessionStorage.setItem("token", response.token);
      sessionStorage.setItem("user", JSON.stringify(response.user));

      // Show success message
      setErrors({ success: "Registration successful! Redirecting..." });

      // Redirect to home after brief delay
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);

    } catch (error) {
      console.error("❌ Registration error:", error);
      setErrors({ register: error.message || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setErrors({});
    setEmail("");
    setPassword("");
    setName("");
    setRegEmail("");
    setRegPassword("");
    setShowPassword(false);
    setRememberMe(false);
  };

  return (
    <div className="login-container">
      <div className="login-background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p className="login-subtitle">
            {isLogin ? "Sign in to find your perfect PG" : "Join us to explore amazing PGs"}
          </p>
          {location.state?.message && (
            <p className="redirect-message">
              {location.state.message}
            </p>
          )}
        </div>

        <div className="switch-buttons">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => switchMode(true)}
            disabled={isLoading}
          >
            Login
          </button>

          <button
            className={!isLogin ? "active" : ""}
            onClick={() => switchMode(false)}
            disabled={isLoading}
          >
            Register
          </button>
        </div>

        {errors.login && (
          <div className="error-message">
            {errors.login}
          </div>
        )}

        {errors.register && (
          <div className="error-message">
            {errors.register}
          </div>
        )}

        {errors.success && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            {errors.success}
          </div>
        )}

        {isLogin ? (
          <form className="form-container" onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({});
                }}
                className={errors.email ? "error" : ""}
                disabled={isLoading}
                autoComplete="email"
              />
              <label>Email Address</label>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder=" "
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({});
                }}
                className={errors.password ? "error" : ""}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <label>Password</label>
              <button 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                disabled={isLoading}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="login-options">
              <div className="remember-me-container">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              
              <div className="forgot-password">
                <a href="#forgot">Forgot Password?</a>
              </div>
            </div>

            <button 
              className="main-btn" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <span className="btn-icon">→</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form className="form-container" onSubmit={handleRegister}>
            <div className="input-group">
              <input
                type="text"
                placeholder=" "
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({});
                }}
                className={errors.name ? "error" : ""}
                disabled={isLoading}
                autoComplete="name"
              />
              <label>Full Name</label>
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder=" "
                value={regEmail}
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  setErrors({});
                }}
                className={errors.regEmail ? "error" : ""}
                disabled={isLoading}
                autoComplete="email"
              />
              <label>Email Address</label>
              {errors.regEmail && <span className="field-error">{errors.regEmail}</span>}
            </div>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder=" "
                value={regPassword}
                onChange={(e) => {
                  setRegPassword(e.target.value);
                  setErrors({});
                }}
                className={errors.regPassword ? "error" : ""}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <label>Password</label>
              <button 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                disabled={isLoading}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
              {errors.regPassword && <span className="field-error">{errors.regPassword}</span>}
            </div>

            <button 
              className="main-btn" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="btn-icon">→</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => switchMode(!isLogin)}
              disabled={isLoading}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}