import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera } from "lucide-react";
import { userAPI, wishlistAPI, authAPI } from "../services/api";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    dateOfBirth: "",
    gender: "",
    occupation: "",
    bio: ""
  });

  useEffect(() => {
    loadUserProfile();
    loadWishlistCount();
  }, [navigate]);

  const loadUserProfile = async () => {
    const isLoggedIn = authAPI.isLoggedIn();
    
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const currentUser = authAPI.getCurrentUser();
      
      if (currentUser) {
        try {
          // Try to fetch full user details from API
          const response = await userAPI.getUserById(currentUser.id || currentUser._id);
          setUser(response.user);
          setProfilePhoto(response.user.profilePhoto || null);
          setFormData({
            name: response.user.name || "",
            email: response.user.email || "",
            phone: response.user.phone || "",
            location: response.user.location || "",
            dateOfBirth: response.user.dateOfBirth || "",
            gender: response.user.gender || "",
            occupation: response.user.occupation || "",
            bio: response.user.bio || ""
          });
        } catch (apiError) {
          // If API call fails, fall back to using data from sessionStorage
          console.warn("API call failed, using cached user data:", apiError);
          setUser(currentUser);
          setProfilePhoto(currentUser.profilePhoto || null);
          setFormData({
            name: currentUser.name || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
            location: currentUser.location || "",
            dateOfBirth: currentUser.dateOfBirth || "",
            gender: currentUser.gender || "",
            occupation: currentUser.occupation || "",
            bio: currentUser.bio || ""
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      alert("Failed to load profile");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadWishlistCount = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      setWishlistCount(response.wishlist?.length || 0);
    } catch (error) {
      console.error("Error loading wishlist count:", error);
      setWishlistCount(0);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePhoto(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updatedData = {
        ...formData,
        profilePhoto: profilePhoto
      };
      
      await userAPI.updateUser(user._id || user.id, updatedData);
      
      // Update local user state
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      
      // Update sessionStorage
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        occupation: user.occupation || "",
        bio: user.bio || ""
      });
      setProfilePhoto(user.profilePhoto || null);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh' 
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
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="loading">User not found</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="profile-photo" />
              ) : (
                <span className="profile-initial">
                  {formData.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <div className="photo-buttons">
              <button 
                className="change-avatar-btn"
                onClick={handleChangePhotoClick}
                disabled={!isEditing}
              >
                <Camera size={18} />
                <span>Change Photo</span>
              </button>
              {profilePhoto && (
                <button 
                  className="remove-avatar-btn"
                  onClick={handleRemovePhoto}
                  disabled={!isEditing}
                >
                  <X size={18} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="profile-header-info">
            <h1>{formData.name || "User"}</h1>
            <p className="profile-email">{formData.email}</p>
            <div className="profile-actions">
              {!isEditing ? (
                <button 
                  className="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={18} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={18} />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="info-grid">
              <div className="info-field">
                <label>
                  <User size={18} />
                  <span>Full Name</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                  />
                ) : (
                  <p>{formData.name || "Not provided"}</p>
                )}
              </div>

              <div className="info-field">
                <label>
                  <Mail size={18} />
                  <span>Email Address</span>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    disabled
                  />
                ) : (
                  <p>{formData.email || "Not provided"}</p>
                )}
              </div>

              <div className="info-field">
                <label>
                  <Phone size={18} />
                  <span>Phone Number</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone"
                  />
                ) : (
                  <p>{formData.phone || "Not provided"}</p>
                )}
              </div>

              <div className="info-field">
                <label>
                  <MapPin size={18} />
                  <span>Location</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter your location"
                  />
                ) : (
                  <p>{formData.location || "Not provided"}</p>
                )}
              </div>

              <div className="info-field">
                <label>
                  <Calendar size={18} />
                  <span>Date of Birth</span>
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{formData.dateOfBirth || "Not provided"}</p>
                )}
              </div>

              <div className="info-field">
                <label>
                  <User size={18} />
                  <span>Gender</span>
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p>{formData.gender || "Not provided"}</p>
                )}
              </div>

              <div className="info-field full-width">
                <label>
                  <User size={18} />
                  <span>Occupation</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="Enter your occupation"
                  />
                ) : (
                  <p>{formData.occupation || "Not provided"}</p>
                )}
              </div>

              <div className="info-field full-width">
                <label>
                  <span>Bio</span>
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                ) : (
                  <p>{formData.bio || "Not provided"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2 className="section-title">Activity</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-value">{wishlistCount}</span>
                  <span className="stat-label">Wishlisted PGs</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Bookings</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Visits Scheduled</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Reviews</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions">
              <button 
                className="action-card"
                onClick={() => navigate('/wishlist')}
              >
                <span className="action-text">View Wishlist</span>
              </button>
              <button className="action-card">
                <span className="action-text">My Bookings</span>
              </button>
              <button className="action-card">
                <span className="action-text">Notifications</span>
              </button>
              <button 
                className="action-card"
                onClick={() => navigate('/settings')}
              >
                <span className="action-text">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}