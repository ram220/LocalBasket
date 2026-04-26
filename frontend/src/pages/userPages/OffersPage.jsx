import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './AllProducts.css'; // use your existing styles
import API_URL from "../../config";

function OffersPage() {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/offer_products`);


        setOffers(res.data.products || []);
      } catch (err) {
        alert(err.response?.data.message || "something went wrong while fetching offers");
      }
    };

    fetchOffers();
  }, []);

  return (
    <div>
      <h2 className="text-center mt-3">
        <strong>
          <span style={{ color: "rgb(255, 106, 0)" }}>Special</span> Offers 🔥
        </strong>
      </h2>

      <div className="products-grid mt-4">
        {offers.length > 0 ? (
          offers.map((p) => (
            <div
              className="product-card"
              key={p._id}
              style={{ width: "18rem", height: "22rem", position: "relative" }}
            >
              {/* 🔥 OFFER BADGE */}
              <span
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  backgroundColor: "red",
                  color: "white",
                  padding: "4px 8px",
                  fontSize: "12px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  zIndex: 1,
                }}
              >
                {p.discountPercentage || 20}% OFF
              </span>

              {/* IMAGE */}
              <img
                src={p.image}
                className="product-img"
                style={{ height: "180px", objectFit: "contain" }}
                alt={p.name}
              />

              <div className="card-body d-flex flex-column">
                <h4 className="card-title text-truncate">{p.name}</h4>

                {/* 💰 PRICE */}
                <h5 className="price">
                  <del style={{ color: "gray", marginRight: "6px" }}>
                    ₹{p.price}
                  </del>
                  ₹{p.finalPrice || Math.round(p.price * 0.8)}
                </h5>

                {/* 👁 VIEW BUTTON */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "auto",
                  }}
                >
                  <small
                    onClick={() =>
                      navigate(`/product_details/${p._id}`)
                    }
                    style={{
                      borderRadius: "3px",
                      backgroundColor: "rgb(252, 107, 3)",
                      color: "white",
                      width: "100px",
                      height: "30px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    view more
                  </small>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "50vh" }}
          >
            <h4>No offers available right now</h4>
          </div>
        )}
      </div>
    </div>
  );
}

export default OffersPage;