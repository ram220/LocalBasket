import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const { token, role } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";
  //const API_URL = "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password/${token}/${role}`, {
        password,
        role
      });

      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data.message || "Reset failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card p-4 shadow">
        <h3 className="text-center mb-3" style={{ color: "rgb(252,107,3)" }}>
          Reset Password
        </h3>

        {message && <p className="text-danger text-center">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="form-control mb-3"
            placeholder="New Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="btn auth-btn w-100" style={{ background: "rgb(252, 107, 3)", color: "#fff" }}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;