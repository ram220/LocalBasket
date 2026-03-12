import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function VendorTopNavbar({logoutUser}) {
    const [isLoggedIn,setIsLoggedIn]=useState(false);
    const [shopOpen,setShopOpen] = useState(true);

    const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";

    //const API_URL="http://localhost:8000";

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
         style={{ backgroundColor: "whitesmoke" }}>

      {/* LOGO */}
      <Link className="navbar-brand d-flex align-items-center" to="/vendor/add_product">
        <img
          src="/localbasket-logo.png"
          alt="logo"
          style={{ height: "40px", marginRight: "10px" }}
        />
        <strong style={{ color: "rgb(255, 107, 2)" }}>Vendor Panel</strong>
      </Link>

      {/* HAMBURGER */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#adminNavbar"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      {/* RIGHT CONTENT */}
      <div className="collapse navbar-collapse justify-content-end" id="adminNavbar">
        <ul className="navbar-nav align-items-center gap-3">

          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <span className="fw-semibold">
                  Hi, <span style={{ color: "rgb(255, 107, 2)" }}>Vendor</span>
                </span>
              </li>

              <li className="nav-item">
  <button
    onClick={toggleShopStatus}
    className="btn btn-sm"
    style={{
      backgroundColor: shopOpen ? "green" : "gray",
      color:"white"
    }}
  >
    {shopOpen ? "Shop Open" : "Shop Closed"}
  </button>
</li>

              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-sm"
                  style={{
                    borderColor: "rgb(255, 107, 2)",
                    color: "rgb(255, 107, 2)"
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                Login
              </Link>
            </li>
          )}

        </ul>
      </div>
    </nav>
  );
}

export default VendorTopNavbar;
