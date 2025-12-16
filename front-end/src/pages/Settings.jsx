import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Lock, 
  Globe, 
  Eye, 
  Trash2, 
  Download,
  Shield,
  Moon,
  Sun,
  Mail,
  Smartphone,
  AlertCircle,
  Check
} from "lucide-react";
import { userAPI, wishlistAPI, authAPI } from "../services/api";
import "./Settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    darkMode: false,
    language: "en",
    twoFactorAuth: false
  });

  useEffect(() => {
    loadUserAndSettings();
  }, []);

  const loadUserAndSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is logged in
      const isLoggedIn = authAPI.isLoggedIn();
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }

      // Get current user from auth
      const currentUser = authAPI.getCurrentUser();
      console.log("Current user from auth:", currentUser);
      
      if (!currentUser) {
        console.error("No current user found");
        navigate("/login");
        return;
      }

      // Check if user has an id property
      const userId = currentUser.id || currentUser._id || currentUser.userId;
      
      if (!userId) {
        console.error("User object has no ID:", currentUser);
        setError("Invalid user session. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      console.log("Fetching user with ID:", userId);
      
      // Fetch full user data
      const response = await userAPI.getUserById(userId);
      console.log("User data response:", response);
      
      if (response && response.user) {
        setUser(response.user);
        
        // Load settings from user data or use defaults
        if (response.user.settings) {
          setSettings(response.user.settings);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setError(error.message || "Failed to load user data");
      
      // If it's an auth error, redirect to login
      if (error.message?.includes("401") || error.message?.includes("token")) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (setting) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting]
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleSelectChange = async (setting, value) => {
    const newSettings = {
      ...settings,
      [setting]: value
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const saveSettings = async (newSettings) => {
    try {
      const userId = user._id || user.id;
      if (!userId) {
        throw new Error("User ID not found");
      }
      
      await userAPI.updateUser(userId, { settings: newSettings });
      showSaveMessage();
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings: " + (error.message || "Unknown error"));
    }
  };

  const showSaveMessage = () => {
    setSaveMessage("Settings saved successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleExportData = async () => {
    try {
      const wishlistResponse = await wishlistAPI.getWishlist();
      
      const userData = {
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt
        },
        settings: settings,
        wishlist: wishlistResponse.wishlist || []
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pgfinder-data-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      alert("Data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data: " + (error.message || "Unknown error"));
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    
    if (window.confirm("Are you absolutely sure? This action cannot be undone. Type DELETE to confirm.")) {
      try {
        const userId = user._id || user.id;
        if (!userId) {
          throw new Error("User ID not found");
        }
        
        await userAPI.deleteUser(userId);
        
        // Clear all session data
        authAPI.logout();
        
        alert("Account deleted successfully");
        navigate("/login");
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #d4af37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: '20px'
        }}>
          <AlertCircle size={48} color="#e74c3c" />
          <h2>Error Loading Settings</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate("/login")}
            style={{
              padding: '10px 20px',
              backgroundColor: '#d4af37',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="settings-container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: '20px'
        }}>
          <AlertCircle size={48} color="#e74c3c" />
          <h2>User Not Found</h2>
          <p>Please log in to access settings</p>
          <button 
            onClick={() => navigate("/login")}
            style={{
              padding: '10px 20px',
              backgroundColor: '#d4af37',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-content">
        <div className="settings-header">
          <h1>Settings</h1>
          <p className="settings-subtitle">Manage your account preferences and settings</p>
        </div>

        {saveMessage && (
          <div className="save-message">
            <Check size={18} />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* Notifications Section */}
        <div className="settings-section">
          <div className="section-header">
            <Bell size={24} />
            <div>
              <h2>Notifications</h2>
              <p>Manage how you receive notifications</p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <Mail size={20} />
                <div>
                  <h3>Email Notifications</h3>
                  <p>Receive updates via email</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <Bell size={20} />
                <div>
                  <h3>Push Notifications</h3>
                  <p>Receive push notifications in browser</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <Smartphone size={20} />
                <div>
                  <h3>SMS Notifications</h3>
                  <p>Receive text messages for important updates</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={() => handleToggle('smsNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <Mail size={20} />
                <div>
                  <h3>Marketing Emails</h3>
                  <p>Receive promotional offers and updates</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={() => handleToggle('marketingEmails')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="settings-section">
          <div className="section-header">
            <Shield size={24} />
            <div>
              <h2>Privacy & Security</h2>
              <p>Control your privacy and security settings</p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <Eye size={20} />
                <div>
                  <h3>Profile Visibility</h3>
                  <p>Who can see your profile</p>
                </div>
              </div>
              <select
                className="setting-select"
                value={settings.profileVisibility}
                onChange={(e) => handleSelectChange('profileVisibility', e.target.value)}
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <Mail size={20} />
                <div>
                  <h3>Show Email Address</h3>
                  <p>Display email on your profile</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.showEmail}
                  onChange={() => handleToggle('showEmail')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <Smartphone size={20} />
                <div>
                  <h3>Show Phone Number</h3>
                  <p>Display phone number on your profile</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.showPhone}
                  onChange={() => handleToggle('showPhone')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <Lock size={20} />
                <div>
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <Lock size={20} />
                <div>
                  <h3>Change Password</h3>
                  <p>Update your account password</p>
                </div>
              </div>
              <button className="action-btn secondary" onClick={handleChangePassword}>
                Change
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Section
        <div className="settings-section">
          <div className="section-header">
            <Sun size={24} />
            <div>
              <h2>Appearance</h2>
              <p>Customize how PGFinder looks</p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <Moon size={20} />
                <div>
                  <h3>Dark Mode</h3>
                  <p>Use dark theme</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <Globe size={20} />
                <div>
                  <h3>Language</h3>
                  <p>Select your preferred language</p>
                </div>
              </div>
              <select
                className="setting-select"
                value={settings.language}
                onChange={(e) => handleSelectChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
              </select>
            </div>
          </div>
        </div> */}

        {/* Data & Account Section */}
        <div className="settings-section">
          <div className="section-header">
            <AlertCircle size={24} />
            <div>
              <h2>Data & Account</h2>
              <p>Manage your account data</p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <Download size={20} />
                <div>
                  <h3>Export Your Data</h3>
                  <p>Download a copy of your data</p>
                </div>
              </div>
              <button className="action-btn secondary" onClick={handleExportData}>
                Export
              </button>
            </div>

            <div className="setting-item danger">
              <div className="setting-info">
                <Trash2 size={20} />
                <div>
                  <h3>Delete Account</h3>
                  <p>Permanently delete your account and data</p>
                </div>
              </div>
              <button 
                className="action-btn danger" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <>
          <div className="popup-overlay" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="popup-container delete-popup">
            <div className="popup-header">
              <h2>Delete Account?</h2>
            </div>
            <div className="popup-content">
              <div className="warning-box">
                <AlertCircle size={48} />
                <h3>This action is irreversible</h3>
                <p>Your account, profile, wishlist, and all associated data will be permanently deleted. You will not be able to recover this information.</p>
              </div>
              <div className="popup-actions">
                <button 
                  className="popup-btn-danger" 
                  onClick={handleDeleteAccount}
                >
                  Yes, Delete My Account
                </button>
                <button 
                  className="popup-btn-secondary" 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}