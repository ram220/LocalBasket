// src/pages/Login.js
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateLogin } from "../../utils/validateLogin";
import API_URL from "../../config";

function Login({setIsLoggedIn,fetchCart}) {
  const [formData,setFormData]=useState({email:"",password:""});
  const [role,setRole]=useState("user");
  const [errors,setErrors]=useState({});

  const [loading,setLoading]=useState(false);


  
  const navigate=useNavigate();

  const handleLogin=async(e)=>{
    e.preventDefault();
    if(loading) return;
    setLoading(true);
    const validationErrors=validateLogin(formData);
    if(Object.keys(validationErrors).length > 0){
      setErrors(validationErrors);
      return;
    }
    
    try{
      let url ="";
      if(!role){
        setErrors("Please select a role")
        return
      }
      if(role==="user") url = `${API_URL}/api/auth/login-user`;
      else if(role==="vendor") url = `${API_URL}/api/auth/login-vendor`;
      else if(role==="delivery_agent") url = `${API_URL}/api/auth/login-agent`;
      else url = `${API_URL}/api/auth/login-admin`;

      const res=await axios.post(url,{email:formData.email,password:formData.password});
      const token=res.data.token;
      localStorage.setItem("token",token);
      localStorage.setItem("role",res.data.role || role);
      setIsLoggedIn(true);
      if(role === "user" && fetchCart){
        fetchCart();
      }

      alert(`${role} login successfully`)

      //redirect base on role
      if(role === "user") navigate("/");
      else if(role === "vendor") navigate("/vendor");
      else if(role==="delivery_agent") navigate("/agent/dashboard")
      else navigate("/admin/vendors");
    }
    catch(err){
      setErrors({general:err.response?.data.message || "login failed"});
    }
    finally{
      setLoading(false)
    }

  }
  return (
    <div className="auth-container">
          <div className="card auth-card p-4 shadow">
            <h2 className="text-center mb-3" style={{ color: "rgb(252, 107, 3)" }}>
              Login
            </h2>
            {errors.general && <p className="text-danger text-center">{errors.general}</p>}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label>Email</label>
                <input className="form-control" type="text" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})}/>
              </div>
              {errors.email && <p className="text-danger">{errors.email}</p>}


              <div className="mb-3">
                <label>Password</label>
                <input className="form-control" type="password" value={formData.password} onChange={(e)=>setFormData({...formData, password:e.target.value})}/>
              </div>
              {errors.password && <p className="text-danger">{errors.password}</p>}

              <div className="mb-2 text-end">
                <Link to="/forgot-password" style={{fontSize:"14px"}}>
                  Forgot Password?
                </Link>
              </div>

              <div className="mb-3">
                <label>Login as</label>
                <select className="form-select" value={role} onChange={(e)=>setRole(e.target.value)}>
                  <option value="user">User</option>
                  <option value="vendor">Vendor</option>
                  <option value="delivery_agent">Delivery Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button className="btn w-100"
              disabled={loading}
                style={{ background: loading ? "#ccc" : "rgb(252,107,3)", color: "#fff",cursor:loading?"not-allowed":"pointer" }}>
                  {loading?"Wait...":"Login"}
              </button>
            </form>

            <div className="mt-3 text-center">
              <p>Don't have an account?</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Link to="/register-user" className="btn btn-outline-primary btn-sm">User</Link>
                <Link to="/register-vendor" className="btn btn-outline-success btn-sm">Vendor</Link>
                <Link to="/register-agent" className="btn btn-outline-warning btn-sm">Delivery Agent</Link>
              </div>
            </div>
          </div>
        </div>
  );
}

export default Login;