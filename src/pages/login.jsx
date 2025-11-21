import { useState } from "react";
import "./login.css";

export default function Login() {
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

  const handleLogin = () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const savedUser = JSON.parse(localStorage.getItem("user"));

      if (
        !savedUser ||
        savedUser.email !== email ||
        savedUser.password !== password
      ) {
        setErrors({ login: "Invalid email or password" });
        setIsLoading(false);
        return;
      }

      localStorage.setItem("loggedIn", "true");
      window.location.href = "/";
    }, 800);
  };

  const handleRegister = () => {
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      const newUser = { name, email: regEmail, password: regPassword };
      localStorage.setItem("user", JSON.stringify(newUser));

      setErrors({ success: "Registration successful! Redirecting to login..." });
      setIsLoading(false);

      setTimeout(() => {
        switchMode(true);
        setErrors({});
      }, 1500);
    }, 800);
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
          <div className="login-icon">🏠</div>
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
            <span className="error-icon">⚠️</span>
            {errors.login}
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
              <span className="input-icon">📧</span>
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
              <span className="input-icon">🔒</span>
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
              <span className="input-icon">👤</span>
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
              <span className="input-icon">📧</span>
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
              <span className="input-icon">🔒</span>
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