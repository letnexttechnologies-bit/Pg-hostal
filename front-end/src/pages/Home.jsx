import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import MapView from "../components/MapView";
import "./Home.css";
import pgList from "../data/pgList";

// PG Card Component with Enhanced Image Slideshow
function PGCard({ pg, onWishlistToggle, isInWishlist, onNavigate }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  // Support both images array and single image property
  const images = pg.images && pg.images.length > 0 
    ? pg.images 
    : (pg.image ? [pg.image] : ['https://via.placeholder.com/400x300?text=No+Image']);

  // Auto-advance slideshow on hover (optional enhancement)
  useEffect(() => {
    let interval;
    if (isHovering && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000); // Change image every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isHovering, images.length]);

  // Reset to first image when PG changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [pg.id]);

  const nextImage = (e) => {
    e.stopPropagation();
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <div className="pg-card" onClick={() => onNavigate(pg.id)}>
      <div 
        className="pg-card-image-container"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Main Image with smooth transition */}
        <div className="image-wrapper">
          <img 
            src={images[currentImageIndex]} 
            alt={`${pg.name} - Image ${currentImageIndex + 1}`}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            }}
          />
        </div>
        
        {/* Navigation Arrows - Only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              className="image-nav-btn prev-btn"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className="image-nav-btn next-btn"
              onClick={nextImage}
              aria-label="Next image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}

        {/* Image Indicators - Only show if multiple images */}
        {images.length > 1 && (
          <div className="image-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={(e) => goToImage(index, e)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image Counter Badge */}
        {images.length > 1 && (
          <div className="image-counter">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      
        {/* Wishlist Button */}
        <button
          className="wishlist-btn"
          onClick={(e) => onWishlistToggle(pg, e)}
          aria-label={isInWishlist(pg.id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill={isInWishlist(pg.id) ? "#ff4444" : "none"}
            stroke={isInWishlist(pg.id) ? "#ff4444" : "#4c4545ff"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      
      <div className="pg-card-content">
        <h3>{pg.name}</h3>
        <p className="location-text">{pg.location}</p>
        <div className="pg-card-details">
          <p className="price">₹{pg.price.toLocaleString()}/month</p>
          <div className="pg-card-info-row">
            <span className="gender">{pg.gender}</span>
            <span className="distance">{pg.distance} km away</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home({ searchQuery: propSearchQuery }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userLocation, setUserLocation] = useState([12.9716, 80.2209]); 
  const [pgsWithDistance, setPGsWithDistance] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (propSearchQuery !== undefined) {
      setSearchQuery(propSearchQuery);
    }
  }, [propSearchQuery]);

  useEffect(() => {
    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        calculateDistance(coords);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Location error:", error);
        calculateDistance([12.9716, 80.2209]);
        setIsLoadingLocation(false);
      }
    );

    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
    }

    const loadWishlist = () => {
      const isLoggedIn = checkUserLoggedIn();
      if (isLoggedIn) {
        const saved = localStorage.getItem('pgWishlist');
        if (saved) {
          setWishlist(JSON.parse(saved));
        }
        
        if (location.state?.pendingWishlistAction) {
          const pgToAdd = location.state.pendingWishlistAction;
          toggleWishlistAfterLogin(pgToAdd);
          
          navigate('/', { replace: true, state: {} });
        }
      } else {
        setWishlist([]);
      }
    };

    loadWishlist();

    window.addEventListener('storage', loadWishlist);
    return () => window.removeEventListener('storage', loadWishlist);
  }, [location.state]);

  const checkUserLoggedIn = () => {
    const loggedIn = localStorage.getItem('loggedIn');
    const authToken = localStorage.getItem('authToken');
    return !!(loggedIn === 'true' || authToken); 
  };

  const calculateDistance = (userCoords) => {
    const result = pgList.map((pg) => {
      const dist = getDistance(
        userCoords[0], userCoords[1],
        pg.latitude, pg.longitude
      );
      return { ...pg, distance: dist.toFixed(2) };
    });
    setPGsWithDistance(result);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleWishlistAfterLogin = (pg) => {
    const saved = localStorage.getItem('pgWishlist');
    const currentWishlist = saved ? JSON.parse(saved) : [];
    const isInWishlist = currentWishlist.some(item => item.id === pg.id);
    
    if (!isInWishlist) {
      const updated = [...currentWishlist, pg];
      setWishlist(updated);
      localStorage.setItem('pgWishlist', JSON.stringify(updated));
      
      alert('Added to wishlist!');
    }
  };

  const toggleWishlist = (pg, e) => {
    e.stopPropagation();
    const isLoggedIn = checkUserLoggedIn();
    
    if (!isLoggedIn) {
      navigate('/login', { 
        state: { 
          from: '/', 
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

  const isInWishlist = (pgId) => {
    return wishlist.some(item => item.id === pgId);
  };

  const filteredPGs = pgsWithDistance.filter(pg => {
    const matchesSearch = searchQuery.trim() === "" || 
      pg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pg.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="home-container">
      <h2 className="title">PGs Near You</h2>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by PG name or location..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <svg 
          className="search-icon"
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>

      <div className="home-layout">
        <div className="main-content">
          {showMap && (
            <div className="map-box">
              <MapView pgs={filteredPGs} userLocation={userLocation} />
            </div>
          )}

          <div className="pg-list">
            {isLoadingLocation ? (
              <div style={{ 
                gridColumn: '1/-1', 
                textAlign: 'center', 
                padding: '60px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
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
                <p style={{ 
                  color: '#666', 
                  fontSize: '18px',
                  fontWeight: '500'
                }}>
                  Loading your current location...
                </p>
              </div>
            ) : filteredPGs.length > 0 ? (
              filteredPGs.map((pg) => (
                <PGCard
                  key={pg.id}
                  pg={pg}
                  onWishlistToggle={toggleWishlist}
                  isInWishlist={isInWishlist}
                  onNavigate={(id) => navigate(`/pg/${id}`)}
                />
              ))
            ) : (
              <p style={{ 
                gridColumn: '1/-1', 
                textAlign: 'center', 
                color: '#666', 
                fontSize: '18px', 
                padding: '40px' 
              }}>
                {searchQuery.trim() !== ""
                  ? `No PGs found matching your search.`
                  : "No PGs found."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}