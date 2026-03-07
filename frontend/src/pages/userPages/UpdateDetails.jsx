import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ChangeAddress() {
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const navigate = useNavigate();

  const token=localStorage.getItem("token");

  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com"
  //const API_URL = "http://localhost:8000";

  // Fetch current details
  useEffect(() => {
    if(!token){
        return;
    }
    const getUserDetails=async()=>{
        try{
            const res=await axios.get(`${API_URL}/api/user/get_user_details`,{
                headers:{Authorization:`Bearer ${token}`}
            })
            setAddress(res.data.address);
            setMobile(res.data.mobile);
        }
        catch(err){
            const message=err.response?.data.message || "something went wrong while updating your details";
            alert(message);
        }
    }
    getUserDetails();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`${API_URL}/api/user/update_details`, {
        address,
        mobile
      },{
        headers:{Authorization:`Bearer ${token}`}
      });
      if (res.data.status === "success") {
        alert("✅ Address updated successfully!");
        navigate("/cart"); // redirect back
      }
    } catch (err) {
        if(err.response?.status === 401){
            alert("Please login first");
            navigate("/login");
        } else {
            alert(err.response?.data?.message || "❌ Failed to update address");
        }
    }
  };

  return (
    <div className="container mt-4">
      <h3>Update <span style={{color:"rgb(252, 107, 3)"}}>Address</span></h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Address</label>
          <textarea
            className="form-control"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label>Mobile</label>
          <input
            type="text"
            className="form-control"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-warning" style={{backgroundColor:"rgb(252, 107, 3)"}}>Save</button>
      </form>
    </div>
  );
}

export default ChangeAddress;
