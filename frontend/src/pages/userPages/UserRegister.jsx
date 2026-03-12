import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { validateRegister } from "../../utils/validateRegister";

function UserRegister() {
  const [formData,setFormData]=useState({
    name:"",
    email:"",
    password: "",
    address: "",
    mobile: "",
  })

  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";
  //const API_URL="http://localhost:8000"

  const [errors,setErrors]=useState({})

  const navigate=useNavigate();

  const handleSubmit=async(e)=>{
      e.preventDefault();

      const validationErrors = validateRegister(formData);
      if(Object.keys(validationErrors).length > 0){
        setErrors(validateRegister);
        return;
      }
      
      try{
        await axios.post(`${API_URL}/api/auth/register-user`,formData);

        alert("user account created successfully");

        navigate("/login");
      }
      catch(err){
        
        setErrors({general:err.response?.data.message || "error while creating user account"});
      }
  }


  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5">
          <div className="card p-4 shadow-sm">
            <h3 className="text-center mb-3" style={{ color: "rgb(252, 107, 3)" }}>
              Register as User
            </h3>

            {errors.general && <p className="text-danger text-center">{errors.general}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Name</label>
                <input className="form-control" type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})}/>
              </div>
              {errors && <p className="text-danger text-center">{errors.name}</p>}

              <div className="mb-3">
                <label>Email</label>
                <input className="form-control" type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})}/>
              </div>
              {errors && <p className="text-danger text-center">{errors.email}</p>}


              <div className="mb-3">
                <label>Password</label>
                <input className="form-control" type="password" value={formData.password} onChange={(e)=>setFormData({...formData, password:e.target.value})}/>
              </div>
              {errors && <p className="text-danger text-center">{errors.password}</p>}

              <div className="mb-3">
                <label>Address</label>
                <input className="form-control" type="text" value={formData.address} onChange={(e)=>setFormData({...formData, address:e.target.value})}/>
              </div>
              {errors && <p className="text-danger text-center">{errors.address}</p>}

              <div className="mb-3">
                <label>Phone</label>
                <input className="form-control" type="number" value={formData.mobile} onChange={(e)=>setFormData({...formData, mobile:e.target.value})}/>
              </div>
              {errors && <p className="text-danger text-center">{errors.mobile}</p>}

              <button className="btn w-100" style={{ background: "rgb(252, 107, 3)", color: "#fff" }}>
                Register
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

export default UserRegister;