import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import MapView from "../components/MapView";
import "./Home.css";
import pgList from "../data/pgList";

export default function Home({ searchQuery: propSearchQuery }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userLocation, setUserLocation] = useState([12.9716, 77.5946]);
  const [pgsWithDistance, setPGsWithDistance] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [wishlist, setWishlist] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync with navbar search prop
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
        // If location access is denied or fails, use default location
        console.error("Location error:", error);
        calculateDistance([12.9716, 77.5946]);
        setIsLoadingLocation(false);
      }
    );

    // Handle search query from navigation state
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
        
        // Handle wishlist action after login redirect
        if (location.state?.pendingWishlistAction) {
          const pgToAdd = location.state.pendingWishlistAction;
          toggleWishlistAfterLogin(pgToAdd);
          // Clear the state
          navigate('/', { replace: true, state: {} });
        }
      }
    };

    loadWishlist();

    // Listen for storage changes (for login updates)
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

  const handlePriceChange = (e) => {
    setMaxPrice(Number(e.target.value));
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
      
      // Optional: Show success message
      alert('Added to wishlist!');
    }
  };

  const toggleWishlist = (pg, e) => {
    e.stopPropagation();
    const isLoggedIn = checkUserLoggedIn();
    
    if (!isLoggedIn) {
      // Store the PG data to add after login
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

  // Filter PGs by price and search query
  const filteredPGs = pgsWithDistance.filter(pg => {
    const matchesPrice = pg.price <= maxPrice;
    const matchesSearch = searchQuery.trim() === "" || 
      pg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pg.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPrice && matchesSearch;
  });

  return (
    <div className="home-container">
      <h2 className="title">PGs Near You</h2>

      {/* Search Bar */}
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

      <button
        className="show-map-btn"
        onClick={() => setShowMap(!showMap)}
      >
        {showMap ? "Hide Map" : "Show Map"}
      </button>

      <div className="home-layout">
        <div className="sidebar">
          <h3>Filters</h3>

          <div className="filter-group">
            <p>Maximum Price</p>
            <div className="price-range-container">
              <input
                type="range"
                min="3000"
                max="50000"
                step="500"
                value={maxPrice}
                onChange={handlePriceChange}
              />
              <span className="range-value">₹{maxPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="filter-group">
            <p>Stay Type</p>
            <label><input type="checkbox" /> Co-living</label>
            <label><input type="checkbox" /> Student Living</label>
          </div>

          <div className="filter-group">
            <p>Sharing Type</p>
            <label><input type="checkbox" /> Private</label>
            <label><input type="checkbox" /> 2 Sharing</label>
            <label><input type="checkbox" /> 3 Sharing</label>
            <label><input type="checkbox" /> 4 Sharing</label>
          </div>

          <div className="filter-group">
            <p>Gender</p>
            <label><input type="checkbox" /> Male</label>
            <label><input type="checkbox" /> Female</label>
            <label><input type="checkbox" /> Unisex</label>
          </div>

          <div className="filter-group">
            <p>Amenities</p>
            <label><input type="checkbox" /> AC</label>
            <label><input type="checkbox" /> Gym</label>
            <label><input type="checkbox" /> Food</label>
            <label><input type="checkbox" /> Fridge</label>
            <label><input type="checkbox" /> Parking</label>
            <label><input type="checkbox" /> Power Backup</label>
          </div>

          <div className="filter-group">
            <p>Locality</p>
            <input type="text" placeholder="Search area..." />
          </div>

          <button className="clear-filters-btn">Clear All Filters</button>
        </div>

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
                <div key={pg.id} className="pg-card" onClick={() => navigate(`/pg/${pg.id}`)}>
                  <div className="pg-card-image-container">
                    <img src={pg.image} alt={pg.name} />
                  
                    <button
                      className="wishlist-btn"
                      onClick={(e) => toggleWishlist(pg, e)}
                      aria-label={isInWishlist(pg.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill={isInWishlist(pg.id) ? "#ff4444" : "none"}
                        stroke={isInWishlist(pg.id) ? "#ff4444" : "#666"}
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
                  ? `No PGs found matching "${searchQuery}". Try a different search term.`
                  : "No PGs found within your budget. Try adjusting the price filter."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}