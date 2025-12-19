import { useEffect, useState } from "react";
import { Heart, ChevronLeft, ChevronRight, ArrowLeft, HeartOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { wishlistAPI } from "../services/api";
import { useAuth } from "../AuthContext";

function WishlistPGCard({ pg, onRemove, onNavigate }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = pg.images && pg.images.length > 0 
    ? pg.images 
    : (pg.image ? [pg.image] : ['https://via.placeholder.com/400x300?text=No+Image']);

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
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #fffef8 100%)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(212, 175, 55, 0.12)",
        border: "2px solid rgba(212, 175, 55, 0.2)",
        transition: "all 0.3s ease",
        position: "relative",
        cursor: "pointer",
      }}
      onClick={() => onNavigate(pg._id || pg.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(212, 175, 55, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(212, 175, 55, 0.12)";
      }}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={images[currentImageIndex]}
          alt={`${pg.name} - Image ${currentImageIndex + 1}`}
          style={{
            width: "100%",
            height: "220px",
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
          }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              style={{
                position: "absolute",
                top: "50%",
                left: "10px",
                transform: "translateY(-50%)",
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)",
                border: "none",
                color: "white",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                zIndex: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              style={{
                position: "absolute",
                top: "50%",
                right: "10px",
                transform: "translateY(-50%)",
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)",
                border: "none",
                color: "white",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                zIndex: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "6px",
              zIndex: 2,
            }}
          >
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(index, e)}
                style={{
                  width: index === currentImageIndex ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: index === currentImageIndex ? "white" : "rgba(255, 255, 255, 0.5)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = index === currentImageIndex ? "white" : "rgba(255, 255, 255, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index === currentImageIndex ? "white" : "rgba(255, 255, 255, 0.5)";
                }}
              />
            ))}
          </div>
        )}

        {images.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(4px)",
              color: "white",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
              zIndex: 2,
            }}
          >
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        <button
          className="wishlist-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(pg._id || pg.id);
          }}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            zIndex: 3,
          }}
        >
          <Heart fill="#ff4757" color="#ff4757" size={20} />
        </button>
      </div>

      <div style={{ padding: "18px" }}>
        <h3
          style={{
            fontSize: "18px",
            margin: "0 0 12px 0",
            fontWeight: "700",
            color: "#2c2c2c",
          }}
        >
          {pg.name}
        </h3>

        <p
          style={{
            fontSize: "14px",
            margin: "0 0 12px 0",
            color: "#666",
          }}
        >
          {pg.location}
        </p>

        <p
          style={{
            fontSize: "22px",
            fontWeight: "800",
            margin: "0 0 12px 0",
            color: "#d4af37",
          }}
        >
          ₹{pg.price.toLocaleString()}/month
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "14px",
              background: "linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)",
              color: "#444",
              fontWeight: "500",
            }}
          >
            {pg.gender}
          </span>
          {pg.distance && (
            <span
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "14px",
                background: "linear-gradient(135deg, #fff8e1 0%, #ffe082 100%)",
                color: "#c5940a",
                fontWeight: "600",
              }}
            >
              {pg.distance} km away
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/login', { 
        state: { 
          from: '/wishlist',
          message: 'Please login to view your wishlist' 
        } 
      });
      return;
    }

    loadWishlist();
  }, [isAuthenticated, navigate]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📋 Loading wishlist for user:', user?.name);
      
      const response = await wishlistAPI.getWishlist();
      setWishlistItems(response.wishlist || []);
      
      console.log('✅ Wishlist loaded:', response.wishlist?.length || 0, 'items');
    } catch (error) {
      console.error("❌ Error loading wishlist:", error);
      
      // Handle 401 Unauthorized errors
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
        console.log('🔓 Token invalid - logging out and redirecting');
        setError('Your session has expired. Please login again.');
        
        // Clear auth and redirect after a short delay
        setTimeout(() => {
          logout();
          navigate('/login', { 
            state: { 
              from: '/wishlist',
              message: 'Session expired. Please login again.' 
            },
            replace: true
          });
        }, 2000);
      } else {
        setError('Failed to load wishlist. Please try again.');
      }
      
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await wishlistAPI.removeFromWishlist(id);
      setWishlistItems(wishlistItems.filter((item) => (item._id || item.id) !== id));
      console.log('✅ Removed from wishlist');
    } catch (error) {
      console.error("❌ Error removing from wishlist:", error);
      
      if (error.message.includes('Unauthorized')) {
        alert('Your session has expired. Please login again.');
        logout();
        navigate('/login', { replace: true });
      } else {
        alert("Failed to remove from wishlist");
      }
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          padding: "40px 20px",
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          flexDirection: 'column',
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
          <p style={{ color: '#666', fontSize: '16px' }}>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          padding: "40px 20px",
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#666",
            fontSize: "18px",
            maxWidth: "600px",
            margin: "0 auto"
          }}
        >
          <div style={{ 
            fontSize: "64px", 
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <HeartOff size={64} strokeWidth={1.5} color="#ff4757" />
          </div>
          <p style={{ 
            marginBottom: "10px", 
            fontWeight: "600",
            color: "#ff4757",
            fontSize: "20px"
          }}>
            {error}
          </p>
          <p style={{ marginBottom: "20px" }}>
            {error.includes('expired') 
              ? 'Redirecting to login...' 
              : 'Please try again later.'}
          </p>
          {!error.includes('expired') && (
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #d4af37 0%, #c5940a 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: "20px"
              }}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "40px 20px",
        fontFamily: '"Poppins", sans-serif',
      }}
    >
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <h2
        style={{
          textAlign: "center",
          color: "#d4af37",
          fontSize: "32px",
          marginBottom: "40px",
          fontWeight: "700",
          letterSpacing: "1px",
        }}
      >
        Your Wishlist
      </h2>

      {wishlistItems.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#666",
            fontSize: "18px",
          }}
        >
          <div style={{ 
            fontSize: "64px", 
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <HeartOff size={64} strokeWidth={1.5} color="#999" />
          </div>
          <p style={{ marginBottom: "10px", fontWeight: "600" }}>
            Your wishlist is empty
          </p>
          <p>Start adding PGs you love!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "24px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {wishlistItems.map((pg) => (
            <WishlistPGCard
              key={pg._id || pg.id}
              pg={pg}
              onRemove={removeFromWishlist}
              onNavigate={(id) => navigate(`/pg/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}