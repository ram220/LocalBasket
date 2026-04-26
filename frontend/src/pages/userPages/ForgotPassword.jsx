import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import API_URL from "../../config";

function ForgotPassword() {
  const [email,setEmail]=useState("");
  const [role,setRole]=useState("user");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  const handleSubmit=async(e)=>{
    if(!email || !role){
      alert("enter email and choose role");
      return;
    }
    e.preventDefault();

    try{
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`,{
        email,
        role
      });

      setMessage(res.data.message);
    }
    catch(err){
      console.log(err);
      setMessage(err.response?.data.message || "Something went wrong");
    }
    finally{
      setLoading(false);
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

          <button className="btn auth-btn w-100" style={{ background: "rgb(252, 107, 3)", color: "#fff" }} disabled={loading}>
            {loading?"Sending...":"Send Reset Link"}
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