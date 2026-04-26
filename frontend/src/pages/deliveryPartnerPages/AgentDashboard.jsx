import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config";

function AgentDashboard() {

  const [isAvailable, setIsAvailable] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if(!token) return;
    const fetchStatus = async () => {
        try {
        const res = await axios.get(
            `${API_URL}/api/agent/getMyAvailabilityStatus`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setIsAvailable(res.data.isAvailable);

        } catch (err) {
        console.log("Error fetching status");
        }
    };

    fetchStatus();
  }, []);

  const handleToggle = async () => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/agent/toggle-availability`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsAvailable(res.data.isAvailable);

    } catch (err) {
      alert("Error updating availability");
    }
  };

  return (
    <div className="container mt-4">

      <div className="card shadow p-4 text-center">

        <h4>Confirm your availability</h4>

        <div className="form-check form-switch d-flex justify-content-center mt-3">

          <input
            className="form-check-input"
            type="checkbox"
            checked={isAvailable}
            onChange={handleToggle}
            style={{ transform: "scale(1.5)" }}
          />

        </div>

        <p className="mt-3">
          Status:
          <strong className={isAvailable ? "text-success" : "text-danger"}>
            {isAvailable ? " Available" : " Not Available"}
          </strong>
        </p>

      </div>

    </div>
  );
}

export default AgentDashboard;