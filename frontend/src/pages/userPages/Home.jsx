import './Home.css'
import Footer from '../../components/userComponents/Footer';
import axios from 'axios'
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home(){
    const [stores,setStores]=useState([]);

    const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com"

    //const API_URL="http://localhost:8000"

    const navigate=useNavigate();

    useEffect(()=>{
        const fetchStores=async()=>{
            const res=await axios.get(`${API_URL}/api/user/stores`)

            setStores(res.data.vendors);
        }
        fetchStores()
    },[])

    return(
        <>
        <div className="container mt-5">
            <div className="row align-items-center">
                {/* Left Side: Text */}
                <div className="col-md-6">
                <h1 className="display-4 fw-bold">
                    Tasty Organic <span style={{color:"rgb(255, 106, 0)"}}>Fruits</span> &<span style={{color:'rgb(255, 106, 0)'}}> Veggies</span> <br /> in Your City
                </h1>
                <p className="mt-3">
                    Fresh, healthy, and delivered straight to your doorstep.
                </p>
                </div>

                {/* Right Side: Image */}
                <div className="col-md-6 text-center">
                <img src="/grocery-bucket.png" alt="Fruits and Veggies"
                    className="img-fluid rounded"
                    style={{ maxHeight: "400px" }}/>
                </div>
            </div>
            
            <div>
                <h2 className="text-center mt-5"><strong><span style={{color:"rgb(255, 106, 0)"}}>Stores</span> we have</strong></h2>
            </div>

            <div className="products-category">
                <div className="row mt-4">
                {stores.map((s) => (
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={s._id} onClick={()=>navigate(`/store/${s._id}`)} style={{cursor:"pointer"}}>
                        <div className="store-card card shadow-sm h-100">

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
                    </div>
                ))}
                </div>
            </div>

            <div>
                <Footer/>
            </div>
        </div>
        </>
    )
}
export default Home;