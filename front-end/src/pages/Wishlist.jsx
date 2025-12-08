import { useEffect, useState } from "react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// PG Card Component with Slideshow for Wishlist
function WishlistPGCard({ pg, onRemove, onNavigate }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Support both 'images' array and legacy 'image' property
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
      onClick={() => onNavigate(pg.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(212, 175, 55, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(212, 175, 55, 0.12)";
      }}
    >
      {/* Image Container with Slideshow */}
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

        {/* Navigation Arrows - Only show if multiple images */}
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

        {/* Image Indicators */}
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

        {/* Image Counter Badge */}
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

       {/* Remove from Wishlist Button */}
      <button
        className="wishlist-btn"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(pg.id);
        }}
      >
        <Heart fill="#ff4757" color="#ff4757" size={20} />
      </button>
      </div>

      {/* Card Content */}
      <div style={{ padding: "18px" }}>
        <h3
          style={{
            fontSize: "18px",
            margin: "0 0 12px 0",
            fontWeight: "700",
            color: "#2c2c2c",
          }}
        >
          🏠 {pg.name}
        </h3>

        <p
          style={{
            fontSize: "14px",
            margin: "0 0 12px 0",
            color: "#666",
          }}
        >
          📍 {pg.location}
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
            👤 {pg.gender}
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
              📍 {pg.distance} km away
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("pgWishlist");
    if (saved) {
      setWishlistItems(JSON.parse(saved));
    }
  }, []);

  const removeFromWishlist = (id) => {
    const updated = wishlistItems.filter((item) => item.id !== id);
    setWishlistItems(updated);
    localStorage.setItem("pgWishlist", JSON.stringify(updated));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "40px 20px",
        fontFamily: '"Poppins", sans-serif',
      }}
    >
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
        ❤️ Your Wishlist
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
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>💔</div>
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
              key={pg.id}
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