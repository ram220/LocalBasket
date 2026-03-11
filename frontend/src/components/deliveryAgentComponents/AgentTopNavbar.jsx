import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function AgentTopNavbar({ logoutUser }) {

    const [isLoggedIn,setIsLoggedIn]=useState(false);

    const navigate=useNavigate();

    useEffect(()=>{
        const token=localStorage.getItem("token");
        if(token){
            setIsLoggedIn(true);
        }
    },[])

    const handleLogout=()=>{
        logoutUser();
        navigate("/login");
    }

    return(
        <nav
                className="navbar navbar-expand-lg navbar-light shadow-sm px-3 sticky-top"
                style={{ backgroundColor: "whitesmoke" }}
                >
                <Link className="navbar-brand d-flex align-items-center" to="/agent">
                    <img
                    src="/localbasket-logo.png"
                    alt="logo"
                    style={{ height: "40px", marginRight: "10px" }}
                    />
                    <strong style={{ color: "rgb(255, 107, 2)" }}>Delivery Agent Panel</strong>
                </Link>

                {/* MOBILE BUTTON */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#adminNavbar"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="adminNavbar">
                    <ul className="navbar-nav align-items-center gap-3">
                        {isLoggedIn && (
                    <>
                        <span className="me-3">
                        Hi, <strong style={{ color: "rgb(255,107,2)" }}>Agent</strong>
                        </span>

                        <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleLogout}
                        >
                        Logout
                        </button>
                    </>
                    )}
                    </ul>
                </div>
        </nav>
    )
}

export default AgentTopNavbar;