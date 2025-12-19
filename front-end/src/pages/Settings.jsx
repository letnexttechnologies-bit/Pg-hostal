import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Lock, 
  Eye, 
  Trash2, 
  Download,
  Shield,
  Mail,
  Smartphone,
  AlertCircle,
  Check
} from "lucide-react";
import { userAPI, wishlistAPI } from "../services/api";
import { useAuth } from "../AuthContext";
import "./Settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, logout: authLogout } = useAuth();
  
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
    // Check authentication first
    if (!isAuthenticated || !authUser) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/login', {
        state: {
          from: '/settings',
          message: 'Please login to access settings'
        }
      });
      return;
    }

    loadUserAndSettings();
  }, [isAuthenticated, authUser, navigate]);

  const loadUserAndSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('⚙️ Loading user and settings for:', authUser?.name);
      
      if (!authUser) {
        throw new Error('No authenticated user');
      }

      const userId = authUser.id || authUser._id;
      
      if (!userId) {
        throw new Error("Invalid user session");
      }

      console.log("📥 Fetching user with ID:", userId);
      
      const response = await userAPI.getUserById(userId);
      console.log("✅ User data response:", response);
      
      if (response && response.user) {
        setUser(response.user);
        
        if (response.user.settings) {
          setSettings(response.user.settings);
        }
        
        console.log('✅ Settings loaded successfully');
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      setError(error.message || "Failed to load user data");
      
      if (error.message?.includes("401") || 
          error.message?.includes("token") || 
          error.message?.includes("Unauthorized")) {
        navigate('/login', {
          state: {
            from: '/settings',
            message: 'Session expired. Please login again.'
          }
        });
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
      
      console.log('💾 Saving settings...');
      await userAPI.updateUser(userId, { settings: newSettings });
      showSaveMessage();
      console.log('✅ Settings saved');
    } catch (error) {
      console.error("❌ Error saving settings:", error);
      alert("Failed to save settings: " + (error.message || "Unknown error"));
    }
  };

  const showSaveMessage = () => {
    setSaveMessage("Settings saved successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleExportData = async () => {
    try {
      console.log('📤 Exporting data...');
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
      
      console.log('✅ Data exported successfully');
      alert("Data exported successfully!");
    } catch (error) {
      console.error("❌ Error exporting data:", error);
      alert("Failed to export data: " + (error.message || "Unknown error"));
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    
    if (window.confirm("Are you absolutely sure? Type DELETE to confirm.")) {
      try {
        const userId = user._id || user.id;
        if (!userId) {
          throw new Error("User ID not found");
        }
        
        console.log('🗑️ Deleting account...');
        await userAPI.deleteUser(userId);
        
        authLogout();
        
        console.log('✅ Account deleted');
        alert("Account deleted successfully");
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("❌ Error deleting account:", error);
        alert("Failed to delete account: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleLogout = () => {
    authLogout();
    navigate("/login", { replace: true });
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
          <p style={{ color: '#666', fontSize: '16px' }}>Loading your settings...</p>
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
    return null; // Will redirect via useEffect
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

            <div className="setting-item">
              <div className="setting-info">
                <Lock size={20} />
                <div>
                  <h3>Logout</h3>
                  <p>Sign out of your account</p>
                </div>
              </div>
              <button 
                className="action-btn secondary" 
                onClick={handleLogout}
              >
                Logout
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