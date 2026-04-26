import './Home.css'
import Footer from '../../components/userComponents/Footer';
import axios from 'axios'
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../config';

function Home(){
    const [stores,setStores]=useState([]);

    const navigate=useNavigate();

    useEffect(()=>{
        const fetchStores=async()=>{
            try {
                const res=await axios.get(`${API_URL}/api/user/stores`)
                setStores(res.data.vendors);
            } catch (err) {
                console.error("Error fetching stores:", err);
            }
        }
        fetchStores()
    },[])

    return(
        <>
        <div className="container mt-4">
            <div className="hero-section row align-items-center mb-5 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #fff7f0 0%, #fff 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                {/* Left Side: Text */}
                <div className="col-md-6 text-center text-md-start">
                    <span className="badge rounded-pill px-3 py-2 mb-3" style={{ background: 'rgba(252, 107, 3, 0.1)', color: 'rgb(252, 107, 3)', fontWeight: '600' }}>🚀 Fast & Fresh</span>
                    <h1 className="display-5 fw-bold mb-3">
                        Fresh Organic <span style={{color:"var(--primary-color)"}}>Groceries</span> <br /> Delivered to You
                    </h1>
                    <p className="lead text-muted mb-4">
                        Quality you can trust, delivered straight to your doorstep every single day.
                    </p>
                    <button className="btn btn-lg px-4 py-2 text-white" style={{ backgroundColor: 'var(--primary-color)', borderRadius: '12px', fontWeight: '600' }} onClick={() => navigate('/products')}>Shop Now</button>
                </div>

                {/* Right Side: Image */}
                <div className="col-md-6 text-center d-none d-md-block">
                    <img src="/grocery-bucket.png" alt="Fruits and Veggies"
                        className="img-fluid rounded-4"
                        style={{ maxHeight: "350px", filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))' }}/>
                </div>
            </div>
            
            <div className="section-header d-flex align-items-center justify-content-between mb-4">
                <h2 className="mb-0 fw-bold">Explore <span style={{color:"var(--primary-color)"}}>Stores</span></h2>
                <button className="btn btn-link text-decoration-none p-0 fw-bold" style={{ color: 'var(--primary-color)' }}>View All</button>
            </div>

            <div className="products-category">
                {stores.map((s) => (
                    <div className="store-card card shadow-sm h-100" key={s._id} onClick={()=>navigate(`/store/${s._id}`)} style={{cursor:"pointer"}}>
                        <div className="store-img-container">
                            <img 
                                src={s.shopImage} 
                                className="card-img-top"
                                alt={s.name}
                            />

                            {s.subscriptionStatus === "expired" && (
                                <div className="store-closed-banner">
                                    Store Temporarily Out of Service
                                </div>
                            )}

                            {s.subscriptionStatus !== "expired" && !s.isShopOpen && (
                                <div className="store-closed-banner">
                                    Shop Closed
                                </div>
                            )}
                        </div>

                        <div className="card-body text-center">
                            <h5>{s.shopName}</h5>
                            <p className="mb-1">{s.address}</p>
                            <small className="text-muted">{s.category}</small>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <Footer/>
            </div>
        </div>
        </>
    )
}
export default Home;