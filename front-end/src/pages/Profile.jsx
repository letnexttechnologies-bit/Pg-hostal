import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera } from "lucide-react";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
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
    // Check if user is logged in
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn !== "true") {
      navigate("/login");
      return;
    }

    // Load user data
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfilePhoto(parsedUser.profilePhoto || null);
      setFormData({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        location: parsedUser.location || "",
        dateOfBirth: parsedUser.dateOfBirth || "",
        gender: parsedUser.gender || "",
        occupation: parsedUser.occupation || "",
        bio: parsedUser.bio || ""
      });
    }
  }, [navigate]);

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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePhoto(base64String);
        
        // Auto-save photo to user data
        const updatedUser = {
          ...user,
          profilePhoto: base64String
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Trigger storage event
        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    const updatedUser = {
      ...user,
      profilePhoto: null
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    window.dispatchEvent(new Event('storage'));
  };

  const handleSave = () => {
    // Update user data
    const updatedUser = {
      ...user,
      ...formData,
      profilePhoto: profilePhoto
    };
    
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
    
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    // Reset form data to original user data
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

  if (!user) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Profile Header */}
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
              >
                <Camera size={18} />
                <span>Change Photo</span>
              </button>
              {profilePhoto && (
                <button 
                  className="remove-avatar-btn"
                  onClick={handleRemovePhoto}
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
                  >
                    <Save size={18} />
                    <span>Save Changes</span>
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-sections">
          {/* Personal Information */}
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

          {/* Account Statistics */}
          <div className="profile-section">
            <h2 className="section-title">Activity</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-value">
                    {JSON.parse(localStorage.getItem('pgWishlist') || '[]').length}
                  </span>
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

          {/* Quick Actions */}
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
              <button className="action-card">
                <span className="action-text">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}