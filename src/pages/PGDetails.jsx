import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Users, Home as HomeIcon, Wifi, Car, Utensils, Dumbbell, Wind, Battery, Heart } from "lucide-react";
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
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (error) => {
        console.error("Location error:", error);
        // Default to Chennai if location access denied
        setUserLocation([12.9716, 80.2209]);
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

  const images = [pg.image, ...(pg.additionalImages || [])];

  return (
    <div className="pg-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="pg-details-content">
        <div className="image-gallery">
          <div className="main-image">
            <img src={images[selectedImage]} alt={pg.name} />
            <button 
              className="wishlist-btn-details"
              onClick={toggleWishlist}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart 
                size={24} 
                fill={isInWishlist ? "#ff4444" : "none"}
                stroke={isInWishlist ? "#ff4444" : "#fff"}
                strokeWidth={2}
              />
            </button>
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-gallery">
              {images.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${pg.name} ${index + 1}`} />
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
                <span className="info-value">{pg.distance || "N/A"} km away</span>
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
            <button className="btn-primary" onClick={() => alert('Contact owner feature coming soon!')}>
              Contact Owner
            </button>
            <button className="btn-secondary" onClick={() => alert('Schedule visit feature coming soon!')}>
              Schedule Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}