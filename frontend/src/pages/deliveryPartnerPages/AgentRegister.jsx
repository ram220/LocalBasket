import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_URL from "../../config";

function RegisterDeliveryAgent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    mobile: "",
    aadhaarImage: null,
    selfieImage: null
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(loading) return;
    setLoading(true);

    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }

    try {
      await axios.post(`${API_URL}/api/auth/register-agent`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Registration submitted. Wait for admin approval.");
    } catch (err) {
      alert(err.response?.data.message || "Error");
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-lg border-0" style={{ borderRadius: "15px" }}>
            <h3 className="text-center mb-3" style={{ color: "rgb(252, 107, 3)" }}>
              Become Delivery Partner 🚚
            </h3>

            <form onSubmit={handleSubmit}>
              <input className="form-control mb-2" placeholder="Name"
                onChange={(e)=>setFormData({...formData,name:e.target.value})} />

              <input className="form-control mb-2" placeholder="Email"
                onChange={(e)=>setFormData({...formData,email:e.target.value})} />

              <input className="form-control mb-2" type="password" placeholder="Password"
                onChange={(e)=>setFormData({...formData,password:e.target.value})} />

              <input className="form-control mb-2" placeholder="Address"
                onChange={(e)=>setFormData({...formData,address:e.target.value})} />

              <input className="form-control mb-3" placeholder="Mobile"
                onChange={(e)=>setFormData({...formData,mobile:e.target.value})} />

              <label>Aadhaar Card</label>
              <input type="file" className="form-control mb-3"
                onChange={(e)=>setFormData({...formData,aadhaarImage:e.target.files[0]})} />

              <label>Selfie</label>
              <input type="file" className="form-control mb-3"
                onChange={(e)=>setFormData({...formData,selfieImage:e.target.files[0]})} />

              <button className="btn w-100"
              disabled={loading}
                style={{ background: loading ? "#ccc" : "rgb(252,107,3)", color: "#fff",cursor:loading?"not-allowed":"pointer" }}>
                  {loading?"Uploading...":"Register"}
              </button>
            </form>
            <p className="mt-3 text-center">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterDeliveryAgent;