import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

function SearchedPage() {
  const [searchedItems, setSearchedItems] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const {fetchCart} = useOutletContext();

  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com"
  //const API_URL = "http://localhost:8000";
  
  const token=localStorage.getItem("token"); 

  // get ?q=pizza
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q");

  useEffect(() => {
    if (!query) return;

    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/user/searchedProduct?q=${query}`
        );

        setSearchedItems(res.data.products || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, [query]);

  const addToCart=async(productId)=>{
    if(!token){
      alert("please login to add items to cart");
      return;
    }
    try{
      const res=await axios.post(`${API_URL}/api/cart/addToCart`,
        {
          productId,
          quantity:1
        },{
          headers:{Authorization:`Bearer ${token}`}
        }
      )
      alert("item added to cart");
      fetchCart();
    }
    catch(err){
      const message=err.response?.data.message;
      alert(message);
    }
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4">
        Search Results for{" "}
        <span style={{ color: "rgb(252, 107, 3)" }}>
          "{query}"
        </span>
      </h3>

      <div className="row">
        {searchedItems.length > 0 ? (
          searchedItems.map((item) => (
            <div key={item._id} className="col-md-3 mb-3">
              <div
                className="card"
                style={{ width: "18rem", height: "22rem" }}
              >
                {/* Add to Cart */}
                <button
                  className="plus-btn"
                  onClick={() => addToCart(item._id)}
                >
                  +
                </button>

                <img
                  src={item.image}
                  alt={item.name}
                  className="card-img-top"
                  style={{ height: "180px", objectFit: "contain" }}
                />

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-truncate">
                    {item.name}
                  </h5>
                {/*
                  <p className="card-text">
                    ₹{item.price}
                  </p>
                  */}

                  <p className="card-text">
                    ₹{item.finalPrice}

{item.isOffer && (
  <span style={{ textDecoration: "line-through", marginLeft: "5px", color: "gray" }}>
    ₹{item.price}
  </span>
)}
                  </p>

                  <small
                    onClick={() =>
                      navigate(`/product_details/${item._id}`)
                    }
                    style={{
                      border: "none",
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
            className="d-flex justify-content-center align-items-center w-100"
            style={{ height: "50vh" }}
          >
            <h4>No products found for "{query}"</h4>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchedPage;