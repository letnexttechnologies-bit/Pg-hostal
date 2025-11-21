import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { LogOut, Heart, Settings, User, Home } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check login status
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("loggedIn");
      const userData = localStorage.getItem("user");
      
      setLoggedIn(isLoggedIn === "true");
      setUser(userData ? JSON.parse(userData) : null);
    };

    checkAuth();

    // Handle scroll
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", checkAuth);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update search query from URL when navigating back to home
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

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("authToken");
      
      setLoggedIn(false);
      setUser(null);
      setShowProfileDropdown(false);
      
      window.dispatchEvent(new Event('storage'));
      navigate("/login");
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Navigate to home page with search query
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
    
    setShowMobileMenu(false);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  return (
    <nav className={`nav-bar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-left" onClick={() => navigate("/")}>
        <span className="logo-text">
          PG<span className="logo-accent">Finder</span>
        </span>
      </div>

      <div className="nav-right">
        {!loggedIn ? (
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
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </button>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="user-avatar-large">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="user-info-dropdown">
                    <p className="user-name-dropdown">{user?.name || "User"}</p>
                    <p className="user-email-dropdown">{user?.email || ""}</p>
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

                <button className="dropdown-item">
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

        <button 
          className={`mobile-menu-toggle ${showMobileMenu ? "active" : ""}`}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}