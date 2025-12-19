import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { LogOut, Heart, Settings, User, Home, Menu, X } from "lucide-react";
import { authAPI } from "../services/api";
import "./Navbar.css";

export default function Navbar({ onFiltersChange, filters, onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  
  // Simple auth state - just what we need
  const [authState, setAuthState] = useState({
    loggedIn: false,
    user: null
  });
  
  const [scrolled, setScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localFilters, setLocalFilters] = useState({
    maxPrice: 25000,
    stayType: [],
    sharingType: [],
    gender: [],
    amenities: [],
    locality: ""
  });

  // Single function to check and update auth - use useCallback to prevent recreating
  const updateAuthState = useCallback(() => {
    const isLoggedIn = authAPI.isLoggedIn();
    const userData = authAPI.getCurrentUser();
    
    console.log('🔄 Updating auth state:', { isLoggedIn, userName: userData?.name });
    
    setAuthState({
      loggedIn: isLoggedIn,
      user: userData
    });
  }, []);

  // Initial check on mount
  useEffect(() => {
    console.log('🎯 Navbar mounted - checking auth');
    updateAuthState();
  }, [updateAuthState]);

  // Check auth when location changes
  useEffect(() => {
    console.log('📍 Location changed:', location.pathname);
    updateAuthState();
  }, [location.pathname, updateAuthState]);

  // Listen for auth events
  useEffect(() => {
    console.log('👂 Setting up auth event listeners');
    
    const handleAuthChange = (event) => {
      console.log('🔔 Auth event received:', event.type, event.detail);
      // Small delay to ensure storage is updated
      setTimeout(() => {
        updateAuthState();
      }, 50);
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    
    return () => {
      console.log('🧹 Cleaning up auth event listeners');
      window.removeEventListener("authStateChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [updateAuthState]);

  // Debug log when state changes
  useEffect(() => {
    console.log('🎨 Navbar render - Logged in:', authState.loggedIn, 'User:', authState.user?.name);
  }, [authState]);

  useEffect(() => {
    if (filters) {
      setLocalFilters(filters);
    }
  }, [filters]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.closest('.hamburger-btn')) {
        setShowSidebar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && location.search) {
      const params = new URLSearchParams(location.search);
      const query = params.get("q");
      if (query) {
        setSearchQuery(query);
      }
    } else if (location.pathname === "/") {
      setSearchQuery("");
    }
  }, [location]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      console.log('🚪 User confirmed logout');
      authAPI.logout();
      
      // Update state immediately
      setAuthState({ loggedIn: false, user: null });
      setShowProfileDropdown(false);
      
      console.log('✅ Navigating to home');
      navigate('/');
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      if (onSearch) {
        onSearch("");
      }
      navigate("/");
    }
    setShowMobileMenu(false);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePriceChange = (e) => {
    const newPrice = Number(e.target.value);
    const updatedFilters = { ...localFilters, maxPrice: newPrice };
    setLocalFilters(updatedFilters);
    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  };

  const handleFilterChange = (category, value) => {
    setLocalFilters(prev => {
      const currentValues = prev[category];
      let updatedFilters;
      
      if (Array.isArray(currentValues)) {
        if (currentValues.includes(value)) {
          updatedFilters = {
            ...prev,
            [category]: currentValues.filter(v => v !== value)
          };
        } else {
          updatedFilters = {
            ...prev,
            [category]: [...currentValues, value]
          };
        }
      } else {
        updatedFilters = {
          ...prev,
          [category]: value
        };
      }
      
      if (onFiltersChange) {
        onFiltersChange(updatedFilters);
      }
      
      return updatedFilters;
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      maxPrice: 25000,
      stayType: [],
      sharingType: [],
      gender: [],
      amenities: [],
      locality: ""
    };
    setLocalFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  };

  return (
    <>
      <nav className={`nav-bar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-left-container">
          <button 
            className="hamburger-btn" 
            onClick={toggleSidebar}
            aria-label="Toggle filters"
          >
            {showSidebar ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="nav-left" onClick={() => navigate("/")}>
            <span className="logo-text">
              PG<span className="logo-accent">Finder</span>
            </span>
          </div>
        </div>

        <div className="nav-right">
          {!authState.loggedIn ? (
            <button onClick={() => navigate("/login")} className="nav-btn login-btn">
              <span>Login</span>
            </button>
          ) : (
            <div className="profile-dropdown-wrapper" ref={dropdownRef}>
              <button 
                className="profile-icon-btn" 
                onClick={toggleProfileDropdown}
                aria-label="Profile menu"
              >
                <span className="profile-avatar">
                  {authState.user?.profilePhoto ? (
                    <img 
                      src={authState.user.profilePhoto} 
                      alt="Profile" 
                      className="profile-avatar-img"
                    />
                  ) : (
                    authState.user?.name?.charAt(0).toUpperCase() || "U"
                  )}
                </span>
              </button>

              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar-large">
                      {authState.user?.profilePhoto ? (
                        <img 
                          src={authState.user.profilePhoto} 
                          alt="Profile" 
                          className="user-avatar-img"
                        />
                      ) : (
                        authState.user?.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div className="user-info-dropdown">
                      <p className="user-name-dropdown">{authState.user?.name || "User"}</p>
                      <p className="user-email-dropdown">{authState.user?.email || ""}</p>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div> 

                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/");
                      setShowProfileDropdown(false);
                    }}
                  >
                    <Home size={18} />
                    <span>Home</span>
                  </button>

                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/wishlist");
                      setShowProfileDropdown(false);
                    }}
                  >
                    <Heart size={18} />
                    <span>My Wishlist</span>
                  </button>

                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/profile");
                      setShowProfileDropdown(false);
                    }}
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </button>

                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/settings");
                      setShowProfileDropdown(false);
                    }}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>

                  <div className="dropdown-divider"></div>

                  <button 
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${showSidebar ? 'show' : ''}`}
        onClick={() => setShowSidebar(false)}
      ></div>

      {/* Filter Sidebar */}
      <div ref={sidebarRef} className={`filter-sidebar ${showSidebar ? 'show' : ''}`}>
        <div className="sidebar-header">
          <h3>Filters</h3>
          <button 
            className="sidebar-close-btn" 
            onClick={() => setShowSidebar(false)}
            aria-label="Close filters"
          >
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="filter-group">
            <p className="filter-label">Maximum Price</p>
            <div className="price-range-container">
              <input
                type="range"
                min="3000"
                max="50000"
                step="500"
                value={localFilters.maxPrice}
                onChange={handlePriceChange}
              />
              <span className="range-value">₹{localFilters.maxPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="filter-group">
            <p className="filter-label">Stay Type</p>
            <label className="filter-checkbox">
              <input 
                type="checkbox" 
                checked={localFilters.stayType.includes('Co-living')}
                onChange={() => handleFilterChange('stayType', 'Co-living')}
              />
              <span>Co-living</span>
            </label>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.stayType.includes('Student Living')}
                onChange={() => handleFilterChange('stayType', 'Student Living')}
              />
              <span>Student Living</span>
            </label>
          </div>

          <div className="filter-group">
            <p className="filter-label">Sharing Type</p>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.sharingType.includes('Private')}
                onChange={() => handleFilterChange('sharingType', 'Private')}
              />
              <span>Private</span>
            </label>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.sharingType.includes('2 Sharing')}
                onChange={() => handleFilterChange('sharingType', '2 Sharing')}
              />
              <span>2 Sharing</span>
            </label>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.sharingType.includes('3 Sharing')}
                onChange={() => handleFilterChange('sharingType', '3 Sharing')}
              />
              <span>3 Sharing</span>
            </label>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.sharingType.includes('4 Sharing')}
                onChange={() => handleFilterChange('sharingType', '4 Sharing')}
              />
              <span>4 Sharing</span>
            </label>
          </div>

          <div className="filter-group">
            <p className="filter-label">Gender</p>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.gender.includes('Male')}
                onChange={() => handleFilterChange('gender', 'Male')}
              />
              <span>Male</span>
            </label>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.gender.includes('Female')}
                onChange={() => handleFilterChange('gender', 'Female')}
              />
              <span>Female</span>
            </label>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.gender.includes('Unisex')}
                onChange={() => handleFilterChange('gender', 'Unisex')}
              />
              <span>Unisex</span>
            </label>
          </div>

          <div className="filter-group">
            <p className="filter-label">Amenities</p>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.amenities.includes('AC')}
                onChange={() => handleFilterChange('amenities', 'AC')}
              />
              <span>AC</span>
            </label>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.amenities.includes('Gym')}
                onChange={() => handleFilterChange('amenities', 'Gym')}
              />
              <span>Gym</span>
            </label>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.amenities.includes('Food')}
                onChange={() => handleFilterChange('amenities', 'Food')}
              />
              <span>Food</span>
            </label>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.amenities.includes('Fridge')}
                onChange={() => handleFilterChange('amenities', 'Fridge')}
              />
              <span>Fridge</span>
            </label>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.amenities.includes('Parking')}
                onChange={() => handleFilterChange('amenities', 'Parking')}
              />
              <span>Parking</span>
            </label>
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={localFilters.amenities.includes('Power Backup')}
                onChange={() => handleFilterChange('amenities', 'Power Backup')}
              />
              <span>Power Backup</span>
            </label>
          </div>

          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Clear All Filters
          </button>
        </div>
      </div>
    </>
  );
}