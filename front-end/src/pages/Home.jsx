import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import MapView from "../components/MapView";
import { pgAPI, wishlistAPI, authAPI } from "../services/api";
import "./Home.css";

// PG Card Component with Enhanced Image Slideshow
function PGCard({ pg, onWishlistToggle, isInWishlist, onNavigate }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  const images = pg.images && pg.images.length > 0 
    ? pg.images 
    : (pg.image ? [pg.image] : ['https://via.placeholder.com/400x300?text=No+Image']);

  // Get the PG ID safely
  const pgId = pg._id || pg.id;

  useEffect(() => {
    let interval;
    if (isHovering && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isHovering, images.length]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [pgId]);

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

  // Check if in wishlist safely
  const inWishlist = pgId ? isInWishlist(pgId) : false;

  return (
    <div className="pg-card" onClick={() => onNavigate(pgId)}>
      <div 
        className="pg-card-image-container"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
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

        {images.length > 1 && (
          <div className="image-counter">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      
        <button
          className="wishlist-btn"
          onClick={(e) => onWishlistToggle(pg, e)}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill={inWishlist ? "#ff4444" : "none"}
            stroke={inWishlist ? "#ff4444" : "#4c4545ff"}
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
          <p className="price">₹{pg.price?.toLocaleString() || 'N/A'}/month</p>
          <div className="pg-card-info-row">
            <span className="gender">{pg.gender || 'N/A'}</span>
            <span className="distance">{pg.distance || '0'} km away</span>
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
  const [isLoadingPGs, setIsLoadingPGs] = useState(true);
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
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Location error:", error);
        setUserLocation([12.9716, 80.2209]);
        setIsLoadingLocation(false);
      }
    );

    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
    }

    // Load PGs and wishlist
    loadPGs();
    loadWishlist();
  }, [location.state]);

  const loadPGs = async () => {
    try {
      setIsLoadingPGs(true);
      const response = await pgAPI.getAllPGs();
      
      // Calculate distance for each PG
      const pgsWithDist = response.pgs.map((pg) => {
        const dist = getDistance(
          userLocation[0], userLocation[1],
          pg.latitude, pg.longitude
        );
        return { ...pg, distance: dist.toFixed(2) };
      });
      
      setPGsWithDistance(pgsWithDist);
    } catch (error) {
      console.error("Error loading PGs:", error);
      // Fallback to empty array if API fails
      setPGsWithDistance([]);
    } finally {
      setIsLoadingPGs(false);
    }
  };

  const loadWishlist = async () => {
    const isLoggedIn = authAPI.isLoggedIn();
    
    if (isLoggedIn) {
      try {
        const response = await wishlistAPI.getWishlist();
        setWishlist(response.wishlist || []);
        
        // Handle pending wishlist action after login
        if (location.state?.pendingWishlistAction) {
          const pgToAdd = location.state.pendingWishlistAction;
          await addToWishlistAfterLogin(pgToAdd);
          navigate('/', { replace: true, state: {} });
        }
      } catch (error) {
        console.error("Error loading wishlist:", error);
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }
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

  const addToWishlistAfterLogin = async (pg) => {
    try {
      await wishlistAPI.addToWishlist(pg._id || pg.id);
      await loadWishlist(); // Reload wishlist
      alert('Added to wishlist!');
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert('Failed to add to wishlist');
    }
  };

// Replace your toggleWishlist and isInWishlist functions in Home.jsx with these:

const toggleWishlist = async (pg, e) => {
  e.stopPropagation();
  
  console.log("=== Toggle Wishlist Debug ===");
  console.log("PG object:", pg);
  console.log("PG ID:", pg._id || pg.id);
  
  const isLoggedIn = authAPI.isLoggedIn();
  console.log("Is logged in:", isLoggedIn);
  console.log("Current token:", sessionStorage.getItem("token") || localStorage.getItem("authToken"));
  
  if (!isLoggedIn) {
    console.log("Not logged in, redirecting to login");
    navigate('/login', { 
      state: { 
        from: '/', 
        message: 'Please login to add items to your wishlist',
        pendingWishlistAction: pg
      } 
    });
    return;
  }
  
  try {
    const pgId = pg._id || pg.id;
    console.log("Using PG ID:", pgId);
    console.log("Current wishlist:", wishlist);
    
    const isInWishlistNow = wishlist.some(item => {
      const itemId = item._id || item.id;
      console.log(`Comparing ${itemId} with ${pgId}:`, itemId === pgId);
      return itemId === pgId;
    });
    
    console.log("Is in wishlist now:", isInWishlistNow);
    
    if (isInWishlistNow) {
      console.log("Removing from wishlist...");
      const response = await wishlistAPI.removeFromWishlist(pgId);
      console.log("Remove response:", response);
      setWishlist(wishlist.filter(item => (item._id || item.id) !== pgId));
      alert('Removed from wishlist');
    } else {
      console.log("Adding to wishlist...");
      const response = await wishlistAPI.addToWishlist(pgId);
      console.log("Add response:", response);
      
      // Update wishlist with the response from backend
      if (response.wishlist) {
        setWishlist(response.wishlist);
      } else {
        setWishlist([...wishlist, pg]);
      }
      alert('Added to wishlist');
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack
    });
    
    if (error.message.includes("Cannot connect to server")) {
      alert('Cannot connect to server. Please check your internet connection and ensure the backend is running.');
    } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      alert('Your session has expired. Please login again.');
      navigate('/login', { 
        state: { 
          from: '/', 
          message: 'Session expired. Please login again.',
        } 
      });
    } else {
      alert(`Failed to update wishlist: ${error.message}`);
    }
  }
};

const isInWishlist = (pgId) => {
  // Safety check: return false if no pgId or wishlist is empty
  if (!pgId || !wishlist || wishlist.length === 0) {
    return false;
  }
  
  try {
    const result = wishlist.some(item => {
      // Safety check: skip if item is null/undefined
      if (!item) return false;
      
      const itemId = item._id || item.id;
      
      // Safety check: skip if itemId is null/undefined
      if (!itemId) return false;
      
      // Convert both to strings for comparison
      return itemId.toString() === pgId.toString();
    });
    
    return result;
  } catch (error) {
    console.error("Error in isInWishlist:", error);
    return false;
  }
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
            {isLoadingLocation || isLoadingPGs ? (
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
                  {isLoadingLocation ? 'Loading your current location...' : 'Loading PGs...'}
                </p>
              </div>
            ) : filteredPGs.length > 0 ? (
              filteredPGs.map((pg) => (
                <PGCard
                  key={pg._id || pg.id}
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