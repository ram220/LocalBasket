import { useEffect, useState } from "react";
import axios from "axios";
import './ProductDetails.css'
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/userComponents/Footer";
import { useOutletContext } from "react-router-dom";

function ProductDetails() {
  const { productId } = useParams();

  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com"
  //const API_URL = "http://localhost:8000";

  const {fetchCart} = useOutletContext();

  const token=localStorage.getItem("token");


  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);

  const navigate = useNavigate();

    useEffect(() => {
      const fetchProduct = async () => {
        const res = await axios.get(`${API_URL}/api/user/product/${productId}`);
        setProduct(res.data.product);
      };

      const fetchRecommendations = async () => {
        const res = await axios.get(`${API_URL}/api/user/recommended/${productId}`);
        setRecommended(res.data.recommendedProducts);
      };

      fetchProduct();
      fetchRecommendations();
    }, [productId]);


    // add items to cart

    const addToCart=async(productId)=>{
        if(!token){
    alert("please login to add items to cart");
    return;
  }

  if(!product.isShopOpen){
    alert("Shop is currently closed");
    return;
  }

  if(!product.inStock){
    alert("Product is out of stock");
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


  if (!product) return <h3 className="text-center mt-5">Loading...</h3>;

  return (
    <div className="container mt-4">
      {/* PRODUCT DETAILS */}
      <div className="row">
        <div className="col-md-5">
          <img
            src={product.image}
            className="img-fluid"
            alt={product.name}
          />
        </div>

        <div className="col-md-7">
          <h2>{product.name}</h2>
          {!product.isShopOpen && (
  <p style={{color:"red", fontWeight:"600"}}>
    Shop is currently closed
  </p>
)}
          {/*
          <h4 className="text-success">
                      ₹{" "}
                      {product.isOffer
                        ? Math.round(
                          product.price -
                          (product.price * product.discountPercentage) / 100
                        )
                        : product.price}

                      {product.isOffer && (
                        <span
                          style={{
                          marginLeft: "10px",
                          textDecoration: "line-through",
                          color: "gray",
                          fontSize: "16px",
                          }}>
                          ₹{product.price}
                        </span>
                      )}
          </h4>
          */}

          <h4 className="text-success">
  ₹{product.finalPrice}

  {product.isOffer && (
    <span
      style={{
        marginLeft: "10px",
        textDecoration: "line-through",
        color: "gray",
        fontSize: "16px",
      }}
    >
      ₹{product.price}
    </span>
  )}
</h4>


          
          {/* Product Description */}
          {product.description && (
            <p className="mt-3">{product.description}</p>
          )}

          {product.isShopOpen && (
  product.inStock ? (
    <button
      className="btn btn-secondary btn-sm mt-3"
      style={{backgroundColor:"rgb(252, 107, 3)"}}
      onClick={() => addToCart(product._id)}
    >
      Add to Cart
    </button>
  ) : (
    <p className="text-danger mt-3">Out of Stock</p>
  )
)}
        </div>
      </div>

      {/* RECOMMENDED PRODUCTS */}
      {recommended.length > 0 && (
        <>
          <h3 className="mt-5">Recommended Products</h3>
          <div className="recommended-grid mt-3">
            {recommended.map((r) => (
              <div
                key={r._id}
                className="card"
                style={{ width: "16rem", cursor: "pointer" }}
                onClick={() => navigate(`/product_details/${r._id}`)}
              >
                <div className="recommended-img-wrapper">
                    <img
                        src={r.image}
                        alt={r.name}
                    />
                  </div>

                <div className="card-body text-center">
                  <h6 className="text-truncate">{r.name}</h6>
                  <p>₹{" "}
                    {r.isOffer ? Math.round(r.price - (r.price * r.discountPercentage) / 100)
                                : r.price} </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}

export default ProductDetails;
