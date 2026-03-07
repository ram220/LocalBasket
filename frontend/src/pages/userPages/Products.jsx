import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

function Products() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);

  const {fetchCart} = useOutletContext();
  
  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com"
  //const API_URL = "http://localhost:8000";

  const token=localStorage.getItem("token");
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/products/${id}`);
        setProducts(res.data.products);
      } catch (err) {
        alert(err.response?.data.message || "Something went wrong while fetching products");
      }
    };

    fetchProducts();
  }, [id]);

  const addToCart=async(productId)=>{
    try{
      await axios.post(`${API_URL}/api/cart/addToCart`,{productId,quantity:1},{
        headers:{Authorization: `Bearer ${token}`}
      })

      alert("item added to cart");
      fetchCart();
    }
    catch(err){
      const message=err.response?.data.message || "something went to wrong while adding product to cart"
      alert(message);
    }
  }

  return (
    <>

      <div className="container mt-4">
        <h2 className="text-center mb-4">
          <span style={{ color: "rgb(255, 106, 0)" }}>Products</span>
        </h2>

        <div className="row">
          {products.map((p) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p._id}>
              <div className="card p-2 shadow-sm h-100">
                <img
                  src={p.image}
                  alt={p.name}
                  className="card-img-top"
                  style={{ height: "150px", objectFit: "contain" }}
                />

                <div className="card-body text-center">
                  <h6>{p.name}</h6>
                  {
                    p.isOffer ? (<p className="fw-bold text-success">₹{p.finalPrice}</p>) : (<p className="fw-bold text-success">₹{p.price}</p>)
                  }

                  <button className="btn btn-sm w-100"
                    onClick={()=>addToCart(p._id)}
                    style={{ background: "rgb(255, 106, 0)", color: "#fff" }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Products;