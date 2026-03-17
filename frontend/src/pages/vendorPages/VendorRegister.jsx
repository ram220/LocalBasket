// src/pages/RegisterVendor.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateRegister } from "../../utils/validateRegister";
import axios from "axios";

function VendorRegister() {
  const [formData,setFormData]=useState({
    name:"",
    email:"",
    password:"",
    shopName:"",
    shopImage:null,
    category:"",
    address:"",
    mobile:""
  });

  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";
  //const API_URL="http://localhost:8000";

  const [errors,setErrors]=useState({});

  const navigate=useNavigate();

  const handleSubmit=async(e)=>{
    e.preventDefault();
    const validateErrors = validateRegister(formData);
    if(Object.keys(validateErrors).length > 0){
      setErrors(validateErrors);
      return;
    }

    try{
      const data=new FormData();

      for(let key in formData){
        data.append(key,formData[key]);
      }
      await axios.post(`${API_URL}/api/auth/register-vendor`,data,{
        headers:{"Content-Type":"multipart/form-data"}
      });

      alert("vendor account created successfully");

      navigate('/login');
    }
    catch(err){
      console.log(err);
      setErrors({general:err.response?.data.message || "error while creating vendor account"})
    }

  }
  return (
    <div className="auth-container">
          <div className="card auth-card p-4 shadow">
            <h3 className="text-center mb-3" style={{ color: "rgb(252, 107, 3)" }}>
              Register as Vendor
            </h3>

            {errors.general && <p className="text-danger text-center">{errors.general}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Name</label>
                <input className="form-control" type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})}/>
              </div>
              {errors.name && <p className="text-danger text-center">{errors.name}</p>}

              <div className="mb-3">
                <label>Email</label>
                <input className="form-control" type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})}/>
              </div>
              {errors.email && <p className="text-danger text-center">{errors.email}</p>}

              <div className="mb-3">
                <label>Password</label>
                <input className="form-control" type="password" value={formData.password} onChange={(e)=>setFormData({...formData, password:e.target.value})}/>
              </div>
              {errors.password && <p className="text-danger text-center">{errors.password}</p>}

              <div className="mb-3">
                <label>Shop Name</label>
                <input className="form-control" type="text" value={formData.shopName} onChange={(e)=>setFormData({...formData, shopName:e.target.value})}/>
              </div>

              <div className="mb-3">
  <label>Shop Image</label>
  <input
    className="form-control"
    type="file"
    accept="image/*"
    onChange={(e)=>
      setFormData({...formData, shopImage:e.target.files[0]})
    }
  />
</div>

              <div className="mb-3">
                <label>Category</label>
                <input className="form-control" type="text" value={formData.category} onChange={(e)=>setFormData({...formData, category:e.target.value})}/>
              </div>

              <div className="mb-3">
                <label>Address</label>
                <input className="form-control" type="text" value={formData.address} onChange={(e)=>setFormData({...formData, address:e.target.value})}/>
              </div>
              {errors.address && <p className="text-danger text-center">{errors.address}</p>}

              <div className="mb-3">
                <label>Phone</label>
                <input className="form-control" type="tel" value={formData.mobile} onChange={(e)=>setFormData({...formData, mobile:e.target.value})}/>
              </div>
              {errors.mobile && <p className="text-danger text-center">{errors.mobile}</p>}

              <button className="btn w-100" style={{ background: "rgb(252, 107, 3)", color: "#fff" }}>
                Register
              </button>
            </form>
            <p className="mt-3 text-center">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        
    </div>
  );
}

export default VendorRegister;