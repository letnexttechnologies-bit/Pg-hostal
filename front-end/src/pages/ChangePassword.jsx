import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { authAPI } from "../services/api";
import "./ChangePassword.css";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
    
    // Clear message
    setMessage({ type: "", text: "" });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    let newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    };
    
    let hasError = false;

    // Validate current password
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
      hasError = true;
    }

    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
      hasError = true;
    } else {
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        newErrors.newPassword = passwordError;
        hasError = true;
      }
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
      hasError = true;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    // Check if new password is same as current
    if (formData.currentPassword === formData.newPassword && formData.currentPassword) {
      newErrors.newPassword = "New password must be different from current password";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    // Submit password change
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const response = await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.success) {
        setMessage({ 
          type: "success", 
          text: "Password changed successfully! Redirecting..." 
        });
        
        // Clear form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/settings");
        }, 2000);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      
      // Check if it's a wrong password error
      if (error.message?.includes("401") || error.message?.includes("incorrect")) {
        setErrors(prev => ({
          ...prev,
          currentPassword: "Current password is incorrect"
        }));
      } else {
        setMessage({ 
          type: "error", 
          text: error.message || "Failed to change password. Please try again." 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-content">
        <button 
          className="back-button"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft size={20} />
          Back to Settings
        </button>

        <div className="change-password-header">
          <div className="header-icon">
            <Lock size={32} />
          </div>
          <h1>Change Password</h1>
          <p>Enter your current password and choose a new one</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.type === "success" ? (
              <Check size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="password-form">
          {/* Current Password */}
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <div className="password-input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPasswords.current ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                className={errors.currentPassword ? "error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="error-message">{errors.currentPassword}</span>
            )}
          </div>

          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPasswords.new ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                className={errors.newPassword ? "error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
            <div className="password-requirements">
              <p>Password must contain:</p>
              <ul>
                <li className={formData.newPassword.length >= 6 ? "met" : ""}>
                  At least 6 characters
                </li>
                <li className={/(?=.*[a-z])/.test(formData.newPassword) ? "met" : ""}>
                  One lowercase letter
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.newPassword) ? "met" : ""}>
                  One uppercase letter
                </li>
                <li className={/(?=.*\d)/.test(formData.newPassword) ? "met" : ""}>
                  One number
                </li>
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPasswords.confirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                className={errors.confirmPassword ? "error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}