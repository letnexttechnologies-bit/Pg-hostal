import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Users, Home as HomeIcon, Wifi, Car, Utensils, Dumbbell, Wind, Battery, Heart } from "lucide-react";
import pgList from "../data/pgList";
import "./PGDetails.css";

export default function PGDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pg, setPG] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);

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