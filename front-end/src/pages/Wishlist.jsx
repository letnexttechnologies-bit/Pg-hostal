import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
            <div
              key={pg.id}
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
              onClick={() => navigate(`/pg/${pg.id}`)}
            >
              <div style={{ position: "relative", overflow: "hidden" }}>
                <img
                  src={pg.image}
                  alt={pg.name}
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                  }}
                />

                {/* Remove PG from wishlist */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation on click
                    removeFromWishlist(pg.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Heart size={20} fill="#ff4444" color="#ff4444" />
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
                  🏠 {pg.name}
                </h3>

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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
