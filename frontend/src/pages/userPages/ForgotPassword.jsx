import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

function ForgotPassword() {
  const [email,setEmail]=useState("");
  const [role,setRole]=useState("user"); // ✅ FIX
  const [message,setMessage]=useState("");

  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";
  //const API_URL="http://localhost:8000";

  const handleSubmit=async(e)=>{
    if(!email || !role){
      alert("enter email and choose role");
      return;
    }
    e.preventDefault();

    try{
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`,{
        email,
        role
      });

      setMessage(res.data.message);
    }
    catch(err){
      setMessage(err.response?.data.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card p-4 shadow">
        <h3 className="text-center mb-3" style={{ color: "rgb(252,107,3)" }}>
          Forgot Password
        </h3>

        {message && <p className="text-center text-info">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input className="form-control mb-3"
            placeholder="Enter your email"
            onChange={(e)=>setEmail(e.target.value)} />

            <select className="form-select mb-3"
              value={role}
              onChange={(e)=>setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
              <option value="delivery_agent">Delivery Agent</option>
              <option value="admin">Admin</option>
            </select>

          <button className="btn auth-btn w-100" style={{ background: "rgb(252, 107, 3)", color: "#fff" }}>
            Send Reset Link
          </button>
        </form>

        <p className="mt-3 text-center">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;