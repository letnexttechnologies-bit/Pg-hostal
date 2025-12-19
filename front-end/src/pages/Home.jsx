import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import MapView from "../components/MapView";
import { pgAPI, wishlistAPI, authAPI } from "../services/api";
import { useAuth } from "../AuthContext";
import "./Home.css";

// PG Card Component with Enhanced Image Slideshow
function PGCard({ pg, onWishlistToggle, isInWishlist, onNavigate }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  const images = pg.images && pg.images.length > 0 
    ? pg.images 
    : (pg.image ? [pg.image] : ['https://via.placeholder.com/400x300?text=No+Image']);

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
            <div className="image-counter">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
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
  const { isAuthenticated, user } = useAuth();
  
  const [userLocation, setUserLocation] = useState([12.9716, 80.2209]); 
  const [pgsWithDistance, setPGsWithDistance] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingPGs, setIsLoadingPGs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Update search query from props
  useEffect(() => {
    if (propSearchQuery !== undefined) {
      setSearchQuery(propSearchQuery);
    }
  }, [propSearchQuery]);

  // Load user location
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
  }, []);

  // Load PGs on mount
  useEffect(() => {
    loadPGs();
  }, [userLocation]);

  // ✅ CRITICAL FIX: Only load wishlist if ACTUALLY authenticated
  useEffect(() => {
    console.log('🔄 [Home] Auth state changed:', { 
      isAuthenticated, 
      userName: user?.name,
      hasToken: !!authAPI.isLoggedIn()
    });
    
    // Double-check authentication before loading wishlist
    if (isAuthenticated && user && authAPI.isLoggedIn()) {
      console.log('✅ [Home] User is authenticated, loading wishlist');
      loadWishlist();
    } else {
      console.log('❌ [Home] Not authenticated, clearing wishlist');
      setWishlist([]);
    }
  }, [isAuthenticated, user]);

  // Handle search query from location state
  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
    }

    // Handle pending wishlist action after login
    if (location.state?.pendingWishlistAction && isAuthenticated) {
      console.log('📌 Processing pending wishlist action after login');
      const pgToAdd = location.state.pendingWishlistAction;
      addToWishlistAfterLogin(pgToAdd);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, isAuthenticated, navigate]);

  const loadPGs = async () => {
    try {
      setIsLoadingPGs(true);
      console.log("📥 Fetching PGs from API...");
      const response = await pgAPI.getAllPGs();
      
      const pgsArray = response.data || response.pgs || [];
      console.log(`📊 Found ${pgsArray.length} PGs`);
      
      if (!Array.isArray(pgsArray)) {
        console.error("❌ PGs data is not an array:", pgsArray);
        setPGsWithDistance([]);
        return;
      }
      
      const pgsWithDist = pgsArray.map((pg) => {
        const dist = getDistance(
          userLocation[0], userLocation[1],
          pg.latitude, pg.longitude
        );
        return { ...pg, distance: dist.toFixed(2) };
      });
      
      setPGsWithDistance(pgsWithDist);
    } catch (error) {
      console.error("❌ Error loading PGs:", error);
      setPGsWithDistance([]);
    } finally {
      setIsLoadingPGs(false);
    }
  };

  const loadWishlist = async () => {
    // ✅ TRIPLE CHECK before making API call
    if (!isAuthenticated || !user) {
      console.log("⚠️ [loadWishlist] Not authenticated, skipping");
      setWishlist([]);
      return;
    }

    // Verify token exists
    const hasToken = authAPI.isLoggedIn();
    if (!hasToken) {
      console.log("⚠️ [loadWishlist] No valid token, skipping");
      setWishlist([]);
      return;
    }
    
    try {
      console.log("📋 [loadWishlist] Loading wishlist for user:", user.name);
      const response = await wishlistAPI.getWishlist();
      console.log("✅ [loadWishlist] Wishlist response received:", response);
      
      const wishlistData = response.data || response.wishlist || [];
      setWishlist(wishlistData);
      console.log(`✅ [loadWishlist] Loaded ${wishlistData.length} items`);
    } catch (error) {
      console.error("❌ [loadWishlist] Error:", error.message);
      
      if (error.message.includes("Unauthorized") || 
          error.message.includes("401") ||
          error.message.includes("Invalid token")) {
        console.log("🔓 Token invalid or expired, clearing wishlist");
        setWishlist([]);
      } else {
        setWishlist([]);
      }
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
      console.log("➕ Adding to wishlist after login:", pg.name);
      const pgId = pg._id || pg.id;
      await wishlistAPI.addToWishlist(pgId);
      await loadWishlist();
      alert('Added to wishlist!');
    } catch (error) {
      console.error("❌ Error adding to wishlist:", error);
      alert('Failed to add to wishlist: ' + error.message);
    }
  };

  const toggleWishlist = async (pg, e) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !authAPI.isLoggedIn()) {
      console.log("🔒 Not authenticated, redirecting to login");
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
      console.log("🔄 Toggle wishlist for PG:", pg.name, "ID:", pgId);
      
      const isInWishlistNow = wishlist.some(item => {
        const itemId = item._id || item.id;
        return itemId?.toString() === pgId?.toString();
      });
      
      if (isInWishlistNow) {
        console.log("➖ Removing from wishlist...");
        await wishlistAPI.removeFromWishlist(pgId);
        setWishlist(wishlist.filter(item => (item._id || item.id) !== pgId));
        console.log("✅ Removed from wishlist");
        alert('Removed from wishlist');
      } else {
        console.log("➕ Adding to wishlist...");
        await wishlistAPI.addToWishlist(pgId);
        
        // Reload wishlist to ensure accuracy
        await loadWishlist();
        
        console.log("✅ Added to wishlist");
        alert('Added to wishlist');
      }
    } catch (error) {
      console.error("❌ Error toggling wishlist:", error);
      
      if (error.message.includes("Cannot connect to server")) {
        alert('Cannot connect to server. Please check your connection.');
      } else if (error.message.includes("Unauthorized") || 
                 error.message.includes("401") ||
                 error.message.includes("Invalid token")) {
        alert('Your session has expired. Please login again.');
        navigate('/login', { 
          state: { 
            from: '/', 
            message: 'Session expired. Please login again.',
            pendingWishlistAction: pg
          } 
        });
      } else {
        alert(`Failed to update wishlist: ${error.message}`);
      }
    }
  };

  const isInWishlist = (pgId) => {
    if (!pgId || !wishlist || wishlist.length === 0) {
      return false;
    }
    
    try {
      const result = wishlist.some(item => {
        if (!item) return false;
        const itemId = item._id || item.id;
        if (!itemId) return false;
        return itemId.toString() === pgId.toString();
      });
      return result;
    } catch (error) {
      console.error("❌ Error in isInWishlist:", error);
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
                  {isLoadingLocation ? 'Loading your location...' : 'Loading PGs...'}
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
                  : "No PGs found. Please make sure the backend is running and database is seeded."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}