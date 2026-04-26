import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react';
import './TopNavBar.css'

function TopNavBar({isLoggedIn,logoutUser,cart}) {

    const [menuOpen, setMenuOpen] = useState(false);

    const[query,setQuery]=useState("");

    const [isListening,setIsListening]=useState(false);


    const navigate=useNavigate();

    const handleSearch=()=>{
        if(!query.trim()) return;
        const cleanedQuery = query
            .toLowerCase()
            .replace(/[.,!?]/g, "")
            .trim();
        navigate(`/searched_product?q=${cleanedQuery}`);
    }

    const handleVoiceSearch=()=>{
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if(!SpeechRecognition){
            alert("voice search not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.start();

        recognition.onstart = ()=> setIsListening(true);

        recognition.onend = ()=> setIsListening(false);

        recognition.onresult = (event)=>{
            let voiceText=event.results[0][0].transcript;

            voiceText = voiceText
                .toLowerCase()
                .replace(/[.,!?]/g, "")
                .trim();

            setQuery(voiceText);

            navigate(`/searched_product?q=${voiceText}`);
        }

        recognition.onerror = (event) => {

            if (event.error === "no-speech") {
                // user didn’t speak → do nothing (silent fail)
                return;
            }

            if (event.error === "not-allowed") {
                alert("Please allow microphone permission");
                return;
            }

        };
        
    }

    const handleLogout = () => {
        logoutUser()

        navigate("/login",{replace:true});
    };


  return (
    <>
        <nav className='navbar p-3 sticky-top glass-effect'>
            <div className="container-fluid d-flex align-items-center">
              <div className='logo me-4' onClick={() => navigate('/')}>
                <img src='/localbasket-logo.png' alt='logo'/>
                <span className="brand-name d-none d-lg-inline ms-2 fw-bold">LocalBasket</span>
              </div>
              
              <div className='rightside-container d-flex align-items-center flex-grow-1 justify-content-between'>
                  <form onSubmit={(e)=>{e.preventDefault();handleSearch()}} className='search-box flex-grow-1 me-4' style={{ maxWidth: '500px' }}>
                      <input type='text' className="form-control" placeholder='Search for groceries...' value={query} onChange={(e)=>setQuery(e.target.value)}/>
                      <button type='button' className='voice-btn' onClick={handleVoiceSearch}>{isListening ? "🎙️" : "🎤"}</button>
                  </form>

                  <div className="nav-actions d-flex align-items-center">
                    {/* Desktop Links */}
                    <ul className="nav-links d-none d-md-flex me-4 mb-0 align-items-center">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">Products</Link></li>
                        {isLoggedIn && (
                          <li>
                            <Link to="/my_orders" className="d-flex align-items-center">
                              My Orders
                            </Link>
                          </li>
                        )}
                        <li>
                          <button 
                            className='btn btn-link text-decoration-none text-dark fw-bold' 
                            onClick={handleLogout}
                          >
                            {isLoggedIn ? "Logout" : "Login"}
                          </button>
                        </li>
                    </ul>

                    {/* Cart Icon */}
                    <div className='cart me-3 me-md-0'>
                        <Link to="/cart" className="cart-icon">
                          <img src="/cart.png" width="30" height="30" alt='cart-icon'/>
                          {cart.length > 0 && <span className='cart-count'>{cart.length}</span>}
                        </Link>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button className="navbar-toggler d-md-none border-0 p-0 ms-2" type="button" onClick={() => setMenuOpen(!menuOpen)}>
                        <span className="fs-3">{menuOpen ? "✕" : "☰"}</span>
                    </button>
                  </div>
              </div>
            </div>

            {/* Mobile Menu Backdrop & Content */}
            {menuOpen && (
                <div className="mobile-menu-overlay d-md-none" onClick={() => setMenuOpen(false)}>
                    <div className="mobile-menu-content p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex flex-column gap-3">
                            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                            <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
                            {isLoggedIn && <Link to="/my_orders" onClick={() => setMenuOpen(false)}>My Orders</Link>}
                            <div className="border-top pt-3 mt-2">
                                {isLoggedIn ? (
                                    <button className="btn btn-outline-danger w-100" onClick={handleLogout}>Logout</button>
                                ) : (
                                    <button className="btn btn-primary w-100" onClick={() => {navigate('/login'); setMenuOpen(false);}}>Login</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    </>
  )
}

export default TopNavBar