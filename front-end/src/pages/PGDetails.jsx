import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Users, Home as HomeIcon, Wifi, Car, Utensils, Dumbbell, Wind, Battery, Heart, X, Phone, Mail, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import pgList from "../data/pgList";
import "./PGDetails.css";

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom PG marker icon (gold)
const pgIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom User Location marker icon (blue)
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function PGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pg, setPG] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showVisitPopup, setShowVisitPopup] = useState(false);
  const [visitForm, setVisitForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    message: ''
  });

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  useEffect(() => {
    const foundPG = pgList.find(p => p.id === parseInt(id));
    if (foundPG) {
      setPG(foundPG);
    } else {
      navigate("/");
    }

    const saved = localStorage.getItem('pgWishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }

    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userCoords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(userCoords);
        
        // Calculate distance if PG has coordinates
        if (foundPG && foundPG.latitude && foundPG.longitude) {
          const dist = calculateDistance(
            userCoords[0],
            userCoords[1],
            foundPG.latitude,
            foundPG.longitude
          );
          setDistance(dist.toFixed(2));
        }
      },
      (error) => {
        console.error("Location error:", error);
        // Default to Chennai if location access denied
        const defaultCoords = [12.9716, 80.2209];
        setUserLocation(defaultCoords);
        
        if (foundPG && foundPG.latitude && foundPG.longitude) {
          const dist = calculateDistance(
            defaultCoords[0],
            defaultCoords[1],
            foundPG.latitude,
            foundPG.longitude
          );
          setDistance(dist.toFixed(2));
        }
      }
    );
  }, [id, navigate]);

  const checkUserLoggedIn = () => {
    const loggedIn = localStorage.getItem('loggedIn');
    const authToken = localStorage.getItem('authToken');
    return !!(loggedIn === 'true' || authToken);
  };

  const toggleWishlist = () => {
    const isLoggedIn = checkUserLoggedIn();
    
    if (!isLoggedIn) {
      navigate('/login', { 
        state: { 
          from: `/pg/${id}`, 
          message: 'Please login to add items to your wishlist',
          pendingWishlistAction: pg
        } 
      });
      return;
    }
    
    const isInWishlist = wishlist.some(item => item.id === pg.id);
    let updated;
    
    if (isInWishlist) {
      updated = wishlist.filter(item => item.id !== pg.id);
    } else {
      updated = [...wishlist, pg];
    }
    
    setWishlist(updated);
    localStorage.setItem('pgWishlist', JSON.stringify(updated));
  };

  const handleVisitFormChange = (e) => {
    setVisitForm({
      ...visitForm,
      [e.target.name]: e.target.value
    });
  };

  const handleScheduleVisit = (e) => {
    e.preventDefault();
    // Here you would typically send this data to your backend
    console.log('Visit scheduled:', visitForm);
    alert('Visit request submitted! The owner will contact you soon.');
    setShowVisitPopup(false);
    setVisitForm({
      name: '',
      phone: '',
      email: '',
      date: '',
      time: '',
      message: ''
    });
  };

  // Navigation functions for image slideshow
  const nextImage = () => {
    if (images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isInWishlist = pg && wishlist.some(item => item.id === pg.id);

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <Wifi size={20} />;
    if (amenityLower.includes('parking')) return <Car size={20} />;
    if (amenityLower.includes('food') || amenityLower.includes('meal')) return <Utensils size={20} />;
    if (amenityLower.includes('gym')) return <Dumbbell size={20} />;
    if (amenityLower.includes('ac')) return <Wind size={20} />;
    if (amenityLower.includes('power') || amenityLower.includes('backup')) return <Battery size={20} />;
    return <HomeIcon size={20} />;
  };

  if (!pg) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
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

  // Support both 'images' array and legacy 'image' + 'additionalImages'
  const images = pg.images && pg.images.length > 0 
    ? pg.images 
    : [pg.image, ...(pg.additionalImages || [])].filter(Boolean);

  return (
    <div className="pg-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="pg-details-content">
        <div className="image-gallery">
          <div className="main-image">
            <img 
              src={images[selectedImage] || 'https://via.placeholder.com/800x600?text=No+Image'} 
              alt={`${pg.name} - Image ${selectedImage + 1}`}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }}
            />
            
            {/* Navigation Arrows for Main Image */}
            {images.length > 1 && (
              <>
                <button 
                  className="main-image-nav-btn prev-btn"
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={28} />
                </button>
                <button 
                  className="main-image-nav-btn next-btn"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            {images.length > 1 && (
              <div className="main-image-counter">
                {selectedImage + 1} / {images.length}
              </div>
            )}

            {/* Wishlist Button */}
            <button 
              className="wishlist-btn"
              onClick={toggleWishlist}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart 
                size={24} 
                fill={isInWishlist ? "#ff4444" : "none"}
                stroke={isInWishlist ? "#ff4444" : "#4c4545ff"}
                strokeWidth={2}
              />
            </button>
          </div>
          
          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="thumbnail-gallery">
              {images.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`${pg.name} ${index + 1}`}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x100?text=No+Image';
                    }}
                  />
                  {selectedImage === index && (
                    <div className="thumbnail-overlay">
                      <div className="thumbnail-check">✓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Map Under Image - Shows both PG and User Location */}
          {pg.latitude && pg.longitude && userLocation && (
            <div className="map-section-gallery">
              <h3>📍 Location</h3>
              <div className="pg-details-map">
                <MapContainer
                  center={[pg.latitude, pg.longitude]}
                  zoom={13}
                  style={{ height: "100%", width: "100%", borderRadius: "12px" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* PG Location Marker (Gold) */}
                  <Marker position={[pg.latitude, pg.longitude]} icon={pgIcon}>
                    <Popup>
                      <div style={{ textAlign: "center" }}>
                        <strong style={{ color: "#d4af37" }}>🏠 {pg.name}</strong>
                        <br />
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          {pg.location}
                        </span>
                        <br />
                        <span style={{ fontSize: "11px", color: "#999", fontStyle: "italic" }}>
                          PG Location
                        </span>
                      </div>
                    </Popup>
                  </Marker>

                  {/* User Location Marker (Blue) */}
                  <Marker position={userLocation} icon={userIcon}>
                    <Popup>
                      <div style={{ textAlign: "center" }}>
                        <strong style={{ color: "#2196F3" }}>📍 Your Location</strong>
                        <br />
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          You are here
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              
              <div className="map-legend">
                <div className="legend-item">
                  <div className="legend-marker legend-marker-gold"></div>
                  <span>PG Location</span>
                </div>
                <div className="legend-item">
                  <div className="legend-marker legend-marker-blue"></div>
                  <span>Your Location</span>
                </div>
              </div>
              
              <p className="map-address">
                <MapPin size={16} />
                {pg.address || pg.location}
              </p>
            </div>
          )}
        </div>

        <div className="details-section">
          <div className="details-header">
            <div>
              <h1>{pg.name}</h1>
              <div className="location-info">
                <MapPin size={18} />
                <span>{pg.location || pg.address || "Location not specified"}</span>
              </div>
            </div>
            <div className="price-badge">
              <span className="price-label">Starting from</span>
              <span className="price-value-pgd">₹{pg.price?.toLocaleString()}/month</span>
            </div>
          </div>

          <div className="quick-info">
            <div className="info-card">
              <Users size={20} />
              <div>
                <span className="info-label">Gender</span>
                <span className="info-value">{pg.gender}</span>
              </div>
            </div>
            <div className="info-card">
              <HomeIcon size={20} />
              <div>
                <span className="info-label">Stay Type</span>
                <span className="info-value">{pg.stayType || "Not specified"}</span>
              </div>
            </div>
            <div className="info-card">
              <HomeIcon size={20} />
              <div>
                <span className="info-label">Sharing Type</span>
                <span className="info-value">{pg.sharingType || "Multiple Options"}</span>
              </div>
            </div>
            <div className="info-card">
              <MapPin size={20} />
              <div>
                <span className="info-label">Distance</span>
                <span className="info-value">{distance || "Calculating..."} km away</span>
              </div>
            </div>
          </div>

          <div className="description-section">
            <h2>About this PG</h2>
            <p>{pg.description || "A comfortable and well-maintained PG accommodation with all essential amenities. Perfect for students and working professionals looking for a safe and convenient living space."}</p>
          </div>

          {pg.amenities && pg.amenities.length > 0 && (
            <div className="amenities-section">
              <h2>Amenities</h2>
              <div className="amenities-grid">
                {pg.amenities.map((amenity, index) => (
                  <div key={index} className="amenity-item">
                    {getAmenityIcon(amenity)}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pg.rules && pg.rules.length > 0 && (
            <div className="rules-section">
              <h2>House Rules</h2>
              <ul>
                {pg.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="contact-section">
            <h2>Contact Information</h2>
            <div className="contact-info">
              {pg.phone && (
                <div className="contact-item">
                  <span className="contact-label">Phone:</span>
                  <a href={`tel:${pg.phone}`} className="contact-value">{pg.phone}</a>
                </div>
              )}
              {pg.email && (
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <a href={`mailto:${pg.email}`} className="contact-value">{pg.email}</a>
                </div>
              )}
              {pg.address && (
                <div className="contact-item">
                  <span className="contact-label">Address:</span>
                  <span className="contact-value">{pg.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={() => setShowContactPopup(true)}>
              Contact Owner
            </button>
            <button className="btn-secondary" onClick={() => setShowVisitPopup(true)}>
              Schedule Visit
            </button>
          </div>
        </div>
      </div>

      {/* Contact Owner Popup */}
      {showContactPopup && (
        <>
          <div className="popup-overlay" onClick={() => setShowContactPopup(false)}></div>
          <div className="popup-container">
            <div className="popup-header">
              <h2>Contact Owner</h2>
              <button className="popup-close" onClick={() => setShowContactPopup(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="popup-content">
              <div className="contact-details">
                <div className="contact-detail-item">
                  <Phone size={20} />
                  <div>
                    <p className="contact-detail-label">Phone Number</p>
                    <a href={`tel:${pg.phone || '+91 9876543210'}`} className="contact-detail-value">
                      {pg.phone || '+91 9876543210'}
                    </a>
                  </div>
                </div>
                <div className="contact-detail-item">
                  <Mail size={20} />
                  <div>
                    <p className="contact-detail-label">Email Address</p>
                    <a href={`mailto:${pg.email || 'owner@example.com'}`} className="contact-detail-value">
                      {pg.email || 'owner@example.com'}
                    </a>
                  </div>
                </div>
                <div className="contact-detail-item">
                  <User size={20} />
                  <div>
                    <p className="contact-detail-label">Owner Name</p>
                    <p className="contact-detail-value">{pg.ownerName || 'Property Owner'}</p>
                  </div>
                </div>
              </div>
              <div className="popup-actions">
                <a href={`tel:${pg.phone || '+91 9876543210'}`} className="popup-btn-primary">
                  <Phone size={18} />
                  Call Now
                </a>
                <a href={`mailto:${pg.email || 'owner@example.com'}`} className="popup-btn-secondary">
                  <Mail size={18} />
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Schedule Visit Popup */}
      {showVisitPopup && (
        <>
          <div className="popup-overlay" onClick={() => setShowVisitPopup(false)}></div>
          <div className="popup-container">
            <div className="popup-header">
              <h2>Schedule a Visit</h2>
              <button className="popup-close" onClick={() => setShowVisitPopup(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="popup-content">
              <form onSubmit={handleScheduleVisit} className="visit-form">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={visitForm.name}
                    onChange={handleVisitFormChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={visitForm.phone}
                      onChange={handleVisitFormChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={visitForm.email}
                      onChange={handleVisitFormChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Preferred Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={visitForm.date}
                      onChange={handleVisitFormChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Preferred Time *</label>
                    <input
                      type="time"
                      name="time"
                      value={visitForm.time}
                      onChange={handleVisitFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message (Optional)</label>
                  <textarea
                    name="message"
                    value={visitForm.message}
                    onChange={handleVisitFormChange}
                    placeholder="Any specific requirements or questions..."
                    rows="3"
                  ></textarea>
                </div>
                <div className="popup-actions">
                  <button type="submit" className="popup-btn-primary">
                    <Calendar size={18} />
                    Confirm Visit
                  </button>
                  <button type="button" className="popup-btn-secondary" onClick={() => setShowVisitPopup(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}