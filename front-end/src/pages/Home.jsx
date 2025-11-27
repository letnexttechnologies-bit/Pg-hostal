import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import MapView from "../components/MapView";
import "./Home.css";
import pgList from "../data/pgList";

export default function Home({ searchQuery: propSearchQuery }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userLocation, setUserLocation] = useState([12.9716, 80.2209]); 
  const [pgsWithDistance, setPGsWithDistance] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [wishlist, setWishlist] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    stayType: [],
    sharingType: [],
    gender: [],
    amenities: [],
    locality: ""
  });

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
        // Clear wishlist when user is not logged in
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

  const handlePriceChange = (e) => {
    setMaxPrice(Number(e.target.value));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const currentValues = prev[category];
      
      if (Array.isArray(currentValues)) {
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [category]: currentValues.filter(v => v !== value)
          };
        } else {
          return {
            ...prev,
            [category]: [...currentValues, value]
          };
        }
      } else {
        return {
          ...prev,
          [category]: value
        };
      }
    });
  };

  const clearAllFilters = () => {
    setFilters({
      stayType: [],
      sharingType: [],
      gender: [],
      amenities: [],
      locality: ""
    });
    setMaxPrice(25000);
    setSearchQuery("");
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
    const matchesPrice = pg.price <= maxPrice;
    const matchesSearch = searchQuery.trim() === "" || 
      pg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pg.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGender = filters.gender.length === 0 || 
      filters.gender.some(g => pg.gender.toLowerCase() === g.toLowerCase());
    
    const matchesStayType = filters.stayType.length === 0 || 
      filters.stayType.some(st => pg.stayType?.toLowerCase() === st.toLowerCase());
    
    const matchesSharingType = filters.sharingType.length === 0 || 
      filters.sharingType.some(st => pg.sharingType?.toLowerCase().includes(st.toLowerCase()));
    
    const matchesAmenities = filters.amenities.length === 0 || 
      filters.amenities.every(amenity => 
        pg.amenities?.some(pgAmenity => pgAmenity.toLowerCase() === amenity.toLowerCase())
      );
    
    const matchesLocality = filters.locality.trim() === "" ||
      pg.location.toLowerCase().includes(filters.locality.toLowerCase());
    
    return matchesPrice && matchesSearch && matchesGender && matchesStayType && 
           matchesSharingType && matchesAmenities && matchesLocality;
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

      {/* Hamburger Filter Toggle Button */}
      <button
        className={`mobile-filter-toggle ${showFilters ? 'active' : ''}`}
        onClick={() => setShowFilters(!showFilters)}
        aria-label="Toggle filters"
      >
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Overlay */}
      <div 
        className={`filter-overlay ${showFilters ? 'show' : ''}`}
        onClick={() => setShowFilters(false)}
      ></div>

      <div className="home-layout">
        <div className={`sidebar ${showFilters ? 'show' : ''}`}>
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
            <label>
              <input 
                type="checkbox" 
                checked={filters.stayType.includes('Co-living')}
                onChange={() => handleFilterChange('stayType', 'Co-living')}
              /> Co-living
            </label>
            <label>
              <input 
                type="checkbox"
                checked={filters.stayType.includes('Student Living')}
                onChange={() => handleFilterChange('stayType', 'Student Living')}
              /> Student Living
            </label>
          </div>

          <div className="filter-group">
            <p>Sharing Type</p>
            <label>
              <input 
                type="checkbox"
                checked={filters.sharingType.includes('Private')}
                onChange={() => handleFilterChange('sharingType', 'Private')}
              /> Private
            </label>
            <label>
              <input 
                type="checkbox"
                checked={filters.sharingType.includes('2 Sharing')}
                onChange={() => handleFilterChange('sharingType', '2 Sharing')}
              /> 2 Sharing
            </label>
            <label>
              <input 
                type="checkbox"
                checked={filters.sharingType.includes('3 Sharing')}
                onChange={() => handleFilterChange('sharingType', '3 Sharing')}
              /> 3 Sharing
            </label>
            <label>
              <input 
                type="checkbox"
                checked={filters.sharingType.includes('4 Sharing')}
                onChange={() => handleFilterChange('sharingType', '4 Sharing')}
              /> 4 Sharing
            </label>
          </div>

          <div className="filter-group">
            <p>Gender</p>
            <label>
              <input 
                type="checkbox"
                checked={filters.gender.includes('Male')}
                onChange={() => handleFilterChange('gender', 'Male')}
              /> Male
            </label>
            <label>
              <input 
                type="checkbox"
                checked={filters.gender.includes('Female')}
                onChange={() => handleFilterChange('gender', 'Female')}
              /> Female
            </label>
            <label>
              <input 
                type="checkbox"
                checked={filters.gender.includes('Unisex')}
                onChange={() => handleFilterChange('gender', 'Unisex')}
              /> Unisex
            </label>
          </div>

          <div className="filter-group">
            <p>Amenities</p>
            <label>
              <input 
                type="checkbox"
                checked={filters.amenities.includes('AC')}
                onChange={() => handleFilterChange('amenities', 'AC')}
              /> AC
            </label>
            <label>
              <input 
                type="checkbox"
                checked={filters.amenities.includes('Gym')}
                onChange={() => handleFilterChange('amenities', 'Gym')}
              /> Gym
            </label>
            <label>
              <input 
                type="checkbox"
                checked={filters.amenities.includes('Food')}
                onChange={() => handleFilterChange('amenities', 'Food')}
              /> Food
            </label>
            <label>
              <input 
                type="checkbox"
                checked={filters.amenities.includes('Fridge')}
                onChange={() => handleFilterChange('amenities', 'Fridge')}
              /> Fridge
            </label>
            <label>
              <input 
                type="checkbox"
                checked={filters.amenities.includes('Parking')}
                onChange={() => handleFilterChange('amenities', 'Parking')}
              /> Parking
            </label>
            <label>
              <input 
                type="checkbox"
                checked={filters.amenities.includes('Power Backup')}
                onChange={() => handleFilterChange('amenities', 'Power Backup')}
              /> Power Backup
            </label>
          </div>

          {/* <div className="filter-group">
            <p>Locality</p>
            <input 
              type="text" 
              placeholder="Search area..."
              value={filters.locality}
              onChange={(e) => handleFilterChange('locality', e.target.value)}
            />
          </div> */}

          <button className="clear-filters-btn" onClick={clearAllFilters}>Clear All Filters</button>
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
                {searchQuery.trim() !== "" || filters.gender.length > 0 || filters.amenities.length > 0
                  ? `No PGs found matching your filters. Try adjusting your search criteria.`
                  : "No PGs found within your budget. Try adjusting the price filter."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}