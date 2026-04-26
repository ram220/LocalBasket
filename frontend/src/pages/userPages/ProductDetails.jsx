import { useEffect, useState } from "react";
import axios from "axios";
import './ProductDetails.css'
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/userComponents/Footer";
import { useOutletContext } from "react-router-dom";
import API_URL from "../../config";

function ProductDetails() {
  const { productId } = useParams();

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
    <div className="product-details-page mt-4">
      <div className="container">
        {/* PRODUCT SECTION */}
        <div className="product-main-card shadow-sm">
          <div className="row g-0">
            {/* Image Column */}
            <div className="col-lg-6 product-image-section">
              <div className="main-image-container">
                <img src={product.image} alt={product.name} className="img-fluid main-product-img" />
                {product.isOffer && (
                  <span className="offer-badge-large">
                    {product.discountPercentage || 20}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Info Column */}
            <div className="col-lg-6 product-info-section p-4 p-md-5">
              <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><small className="text-muted" style={{cursor:'pointer'}} onClick={()=>navigate('/')}>Home</small></li>
                  <li className="breadcrumb-item"><small className="text-muted" style={{cursor:'pointer'}} onClick={()=>navigate('/products')}>Products</small></li>
                  <li className="breadcrumb-item active" aria-current="page"><small>{product.name}</small></li>
                </ol>
              </nav>

              <h1 className="product-title mb-2">{product.name}</h1>
              <p className="shop-name text-muted mb-4">By <span className="fw-bold text-primary">{product.shopName || "Local Vendor"}</span></p>

              <div className="price-container mb-4">
                <h2 className="current-price">₹{product.finalPrice}</h2>
                {product.isOffer && (
                  <div className="old-price-wrapper">
                    <span className="text-decoration-line-through text-muted me-2">₹{product.price}</span>
                    <span className="discount-tag">Save ₹{product.price - product.finalPrice}</span>
                  </div>
                )}
              </div>

              {/* Status Indicators */}
              <div className="status-badges mb-4 d-flex flex-wrap gap-2">
                {product.subscriptionStatus === "expired" ? (
                  <span className="badge bg-danger-soft text-danger px-3 py-2">
                    <i className="bi bi-exclamation-triangle me-2"></i>Shop Temporarily Offline
                  </span>
                ) : !product.isShopOpen ? (
                  <span className="badge bg-warning-soft text-warning px-3 py-2">
                    <i className="bi bi-clock me-2"></i>Shop Currently Closed
                  </span>
                ) : product.inStock ? (
                  <span className="badge bg-success-soft text-success px-3 py-2">
                    <i className="bi bi-check-circle me-2"></i>In Stock
                  </span>
                ) : (
                  <span className="badge bg-danger-soft text-danger px-3 py-2">
                    <i className="bi bi-x-circle me-2"></i>Out of Stock
                  </span>
                )}
              </div>

              <div className="product-description-box mb-4">
                <h6 className="fw-bold mb-2">Description</h6>
                <p className="text-muted leading-relaxed">
                  {product.description || "No description available for this product."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="action-area mt-auto">
                <button
                  className="btn btn-lg w-100 add-to-cart-btn-premium py-3"
                  disabled={!product.isShopOpen || !product.inStock || product.subscriptionStatus === "expired"}
                  onClick={() => addToCart(product._id)}
                >
                  {!product.inStock ? "Out of Stock" : !product.isShopOpen || product.subscriptionStatus === "expired" ? "Shop Closed" : "Add to Cart"}
                </button>
                <p className="text-center mt-3 mb-0">
                  <small className="text-muted card-secure-text">
                    <i className="bi bi-shield-check me-1"></i> Secure Transaction
                  </small>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RECOMMENDED SECTION */}
        {recommended.length > 0 && (
          <div className="recommended-section mt-5 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold section-title m-0">Recommended for You</h3>
              <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={()=>navigate('/products')}>View All</button>
            </div>
            
            <div className="recommended-scroll-wrapper">
              <div className="recommended-grid-premium">
                {recommended.map((r) => (
                  <div
                    key={r._id}
                    className="recommended-product-card"
                    onClick={() => navigate(`/product_details/${r._id}`)}
                  >
                    <div className="img-container">
                      <img src={r.image} alt={r.name} />
                      {r.isOffer && <span className="discount-pill">-{r.discountPercentage}%</span>}
                    </div>
                    <div className="card-info p-3">
                      <h6 className="text-truncate mb-1">{r.name}</h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="price-tag">₹{r.isOffer ? Math.round(r.price - (r.price * r.discountPercentage) / 100) : r.price}</span>
                        <button className="btn btn-sm add-quick-btn">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default ProductDetails;
