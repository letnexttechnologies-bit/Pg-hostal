import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authAPI.login({ email, password });
      
      // Store token and user data
      sessionStorage.setItem("token", response.token);
      sessionStorage.setItem("user", JSON.stringify(response.user));
      sessionStorage.setItem("loggedIn", "true");

      // Show success message briefly
      setErrors({ success: "Login successful! Redirecting..." });

      // Redirect to home page
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (error) {
      setErrors({ login: error.message || "Invalid email or password" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authAPI.register({
        name,
        email: regEmail,
        password: regPassword
      });

      // Show success message
      setErrors({ success: "Registration successful! Please login to continue." });

      // Switch to login mode after 1.5 seconds
      setTimeout(() => {
        switchMode(true);
        setErrors({});
        // Pre-fill email for convenience
        setEmail(regEmail);
      }, 1500);

    } catch (error) {
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
          <div className="form-container">
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

            <div className="forgot-password">
              <a href="#forgot">Forgot Password?</a>
            </div>

            <button 
              className="main-btn" 
              onClick={handleLogin}
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
          </div>
        ) : (
          <div className="form-container">
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
              onClick={handleRegister}
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
          </div>
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