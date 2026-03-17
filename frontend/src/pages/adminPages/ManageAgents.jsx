import { useEffect, useState } from "react";
import axios from "axios";

function ManageAgents() {

    const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";
  //const API_URL = "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [agents, setAgents] = useState([]);

  const fetchAgents = async () => {
    const res = await axios.get(`${API_URL}/api/admin/getAllAgents`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(res.data);
    setAgents(res.data.agents);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const approveAgent = async (id) => {
    await axios.patch(`${API_URL}/api/admin/approveAgent/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAgents();
  };

  const deleteAgent = async (id) => {
    await axios.delete(`${API_URL}/api/admin/deleteAgent/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAgents();
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">Delivery Agents</h3>

      {agents.length === 0 ? (
        <p className="text-center">No Delivery Agents</p>
      ) : (
        <div className="row">
          {agents.map((a) => (
            <div key={a._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              
              <div className="card shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
                
                {/* Selfie */}
                <img
                  src={a.selfieImage}
                  alt="selfie"
                  style={{
                    height: "180px",
                    objectFit: "cover",
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px"
                  }}
                />

                <div className="card-body text-center">

                  <h5 className="card-title">{a.name}</h5>
                  <p className="mb-1">{a.email}</p>
                  <p className="mb-1">{a.mobile}</p>

                  <span className={`badge ${
                    a.status === "approved" ? "bg-success" : "bg-warning"
                  }`}>
                    {a.status}
                  </span>

                  {/* Aadhaar preview */}
                  <div className="mt-2">
                    <a href={a.aadhaarImage} target="_blank" rel="noreferrer">
                        
                      View Aadhaar
                    </a>
                  </div>

                  <div className="mt-3 d-flex justify-content-center gap-2">

                    {a.status !== "approved" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => approveAgent(a._id)}
                      >
                        Approve
                      </button>
                    )}

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteAgent(a._id)}
                    >
                      Delete
                    </button>

                  </div>

                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageAgents;