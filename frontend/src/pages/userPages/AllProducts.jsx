import React, { useEffect, useState } from "react";
import axios from "axios";
import Footer from "../../components/userComponents/Footer";
import "./AllProducts.css";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [shopClosedMsg,setShopClosedMsg]=useState("");

  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com"

  //const API_URL = "http://localhost:8000";

  const {fetchCart} = useOutletContext();

  const navigate=useNavigate();

  const token=localStorage.getItem("token");


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/products`);
        //setProducts(res.data.filteredProducts);
        setProducts(res.data.finalProducts || []);
      } catch (err) {
        alert(err.response?.data.message || "Something went wrong while fetching Products");
      }
    };

    fetchProducts();
  }, []);

  // add items to cart

  const addToCart=async(productId,product)=>{
    if(!token){
      alert("please login to add items to cart");
      return;
    }
    if(product.subscriptionStatus==="expired"){
      alert("Shop is temporarily out of service");
      return;
    }
    try{
        await axios.post(`${API_URL}/api/cart/addToCart`,
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

  // 👉 Filter logic
  const filteredProducts =
    category === "all"
      ? products
      : products.filter((p) => p.category === category);

  return (
    <>
      <div className="container mt-4">
        <h2 className="text-center mb-4">
          <span style={{ color: "rgb(255, 106, 0)" }}>All Products</span>
        </h2>

        {/* 🔥 CATEGORY FILTER */}
        <div className="products-filter">
          {["all", "Grocery", "Junk Foods", "Medical", "Bakery","Sweets","Fruits & Juices"].map((cat) => (
            <button
              key={cat}
              className="products-btn"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 🔥 PRODUCTS GRID */}
        <div className="products-grid mt-4">
          {filteredProducts.map((p) => (
            <div key={p._id} className="product-card">
              

              <button className="plus-btn" disabled={!p.inStock || !p.isShopOpen || p.subscriptionStatus==="expired"}
                style={{opacity: (!p.inStock || !p.isShopOpen || p.subscriptionStatus==="expired") ? 0.5 : 1,
                  cursor: (!p.inStock || !p.isShopOpen || p.subscriptionStatus==="expired") ? "not-allowed" : "pointer"
                }}
                onClick={()=>addToCart(p._id,p)}>+
              </button>

              <div className="product-image-container">

                  <img src={p.image} className="product-img" alt={p.name} />

{p.subscriptionStatus === "expired" && (
  <div className="shop-closed-badge">
    Shop Temporarily Out of Service
  </div>
)}

{p.subscriptionStatus !== "expired" && !p.isShopOpen && (
  <div className="shop-closed-badge">
    Shop Closed
  </div>
)}
              </div>

              <div className="card-body d-flex flex-column">
                <h4 className="text-center">{p.name}</h4>

     
                {/*<h5 className="text-center">{p.price}</h5>*/}

                <h5 className="text-center">₹{p.finalPrice}

                  {p.isOffer && (
                    <span style={{ textDecoration: "line-through", marginLeft: "8px", color: "gray" }}>
                      ₹{p.price}
                    </span>
                  )}
                </h5>
                <p className="text-center">{p.shopName}</p>

                <div style={{display:'flex',justifyContent:'center',alignItems:'center',margin:'10px 0'}}>
                  {
                    p.inStock ? (
                      <small onClick={()=>navigate(`/product_details/${p._id}`)}
                        style={{
                            border: 'none',
                            borderRadius: '3px',
                            backgroundColor: 'rgb(252, 107, 3)',
                            color: 'white',
                            width: '100px',
                            height: '30px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: 'bold',
                            cursor:'pointer'
                        }}> view more
                      </small>) : (
                        <small
                          style={{
                            border: 'none',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(252, 3, 3, 1)',
                            color: 'white',
                            width: '100px',
                            height: '30px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: 'bold',
                          }}> Out of stock
                        </small>
                      )
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default AllProducts;