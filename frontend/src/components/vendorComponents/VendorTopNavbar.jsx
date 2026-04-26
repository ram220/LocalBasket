import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import API_URL from "../../config";

function VendorTopNavbar({logoutUser}) {
    const [isLoggedIn,setIsLoggedIn]=useState(false);
    const [shopOpen,setShopOpen] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigate=useNavigate()

    const token=localStorage.getItem("token");

    useEffect(()=>{
        const checkToken=()=>{
            if(!token){
                setIsLoggedIn(false);
                return;
            }
            setIsLoggedIn(true);
            
        }


        const fetchShopStatus = async () => {
          try{

              const res = await fetch(`${API_URL}/api/vendor/shop-status`,{
                  headers:{
                      Authorization:`Bearer ${token}`
                  }
              });

              const data = await res.json();

              setShopOpen(data.isShopOpen);

          }catch(err){
              console.log(err);
          }
        }

        checkToken();
        fetchShopStatus();
    },[])

    const handleLogout=()=>{
        logoutUser();
        navigate('/login')
    }


    const toggleShopStatus = async () => {

        try{

            const token = localStorage.getItem("token");

            const res = await fetch(
                `${API_URL}/api/vendor/toggle-shop`,
                {
                    method:"PATCH",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:`Bearer ${token}`
                    }
                }
            );

            const data = await res.json();

            setShopOpen(data.isShopOpen);

        }catch(err){
            console.log(err);
        }

    }

  return (
    <nav className="navbar navbar-expand-lg navbar-light shadow-sm px-3 sticky-top"
         style={{ backgroundColor: "white", height: "70px" }}>

      <div className="container-fluid d-flex align-items-center justify-content-between p-0">
        {/* LOGO & HAMBURGER */}
        <div className="d-flex align-items-center">
            <button 
                className="btn border-0 me-2" 
                style={{ fontSize: "1.5rem", color: "#333" }}
                onClick={() => setIsMenuOpen(true)}
            >
                ☰
            </button>
            <Link className="navbar-brand d-flex align-items-center m-0" to="/vendor/view_products">
                <img
                src="/localbasket-logo.png"
                alt="logo"
                style={{ height: "35px", marginRight: "10px" }}
                />
                <strong className="d-none d-sm-inline" style={{ color: "rgb(255, 107, 2)" }}>Vendor Panel</strong>
            </Link>
        </div>

        {/* RIGHT CONTENT */}
        <div className="d-flex align-items-center gap-3">
          {isLoggedIn && (
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={toggleShopStatus}
                className="btn btn-sm fw-bold px-3 py-1"
                style={{
                  backgroundColor: shopOpen ? "rgba(0, 128, 0, 0.1)" : "rgba(128, 128, 128, 0.1)",
                  color: shopOpen ? "green" : "gray",
                  borderRadius: "20px",
                  border: `1px solid ${shopOpen ? "green" : "gray"}`
                }}
              >
                {shopOpen ? "● Open" : "○ Closed"}
              </button>

              <button
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm fw-bold border-0"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DRAWER OVERLAY (Matched to User Panel) */}
      {isMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}>
              <div className="mobile-menu-content p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="fw-bold m-0" style={{ color: "rgb(255, 107, 2)" }}>Vendor Menu</h5>
                      <button className="btn border-0 p-0" style={{ fontSize: "1.5rem" }} onClick={() => setIsMenuOpen(false)}>✕</button>
                  </div>
                  <div className="d-flex flex-column gap-3">
                    <Link to="/vendor/view_products" className="drawer-link" onClick={() => setIsMenuOpen(false)}>View Products</Link>
                    <Link to="/vendor/add_product" className="drawer-link" onClick={() => setIsMenuOpen(false)}>Add Product</Link>
                    <Link to="/vendor/view_orders" className="drawer-link" onClick={() => setIsMenuOpen(false)}>View Orders</Link>
                    <Link to="/vendor/total_income" className="drawer-link" onClick={() => setIsMenuOpen(false)}>Profitability</Link>
                    <div className="border-top pt-3 mt-2">
                        <button className="btn btn-outline-danger w-100" onClick={handleLogout}>Logout</button>
                    </div>
                  </div>
              </div>
          </div>
      )}

      <style>{`
        .mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
            display: flex;
            justify-content: flex-start; /* Slide in from LEFT */
        }
        .mobile-menu-content {
            width: 280px;
            height: 100vh;
            background: white !important;
            animation: slideInLeft 0.3s ease-out;
            display: flex;
            flex-direction: column;
            box-shadow: 5px 0 15px rgba(0,0,0,0.1);
        }
        @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
        }
        .drawer-link {
          text-decoration: none;
          color: #333 !important;
          font-weight: 600;
          font-size: 1.1rem;
          padding: 10px 0;
          display: block;
          transition: color 0.2s;
        }
        .drawer-link:hover {
          color: rgb(255, 107, 2) !important;
        }
      `}</style>
    </nav>
  );
}

export default VendorTopNavbar;
