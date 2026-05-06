import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import API_URL from "../../config";

function AdminDashboard() {
  const [data, setData] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/admin/getPlatformEarnings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const chartData = (res.data.earnings || []).map(item => ({
          month: `${item._id.month}-${item._id.year}`,
          totalEarnings: item.totalEarnings,
          orderCount: item.orderCount
        }));

        setData(chartData);
        
        const sumEarnings = chartData.reduce((acc, curr) => acc + curr.totalEarnings, 0);
        const sumOrders = chartData.reduce((acc, curr) => acc + curr.orderCount, 0);
        
        setTotalEarnings(sumEarnings);
        setTotalOrders(sumOrders);

      } catch (err) {
        console.error("Error fetching earnings:", err);
        const message = err.response?.data.message || "Something went wrong while fetching earnings";
        alert(message);
      }
    };

    fetchEarnings();
  }, [token]);

  return (
    <div className="p-4 p-lg-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold m-0" style={{ color: "#333" }}>
            Platform Monthly Income
        </h2>
        <p className="text-muted small">Tracking ₹10 Platform Fee per delivered order</p>
      </div>

      <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: "16px", backgroundColor: "#fff" }}>
        <h5 className="mb-4 fw-bold">Revenue Trend</h5>
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip 
                contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            />
            <Bar name="Earnings (₹)" dataKey="totalEarnings" fill="#fa6704ff" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
            <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
                <h3 className="text-muted small text-uppercase fw-bold mb-2">Total Platform Earnings</h3>
                <p className="text-3xl font-bold mb-0" style={{ color: "#087f5b", fontSize: "2rem" }}>
                    ₹ {totalEarnings}
                </p>
                <div className="mt-2 text-success small fw-bold">Profitable</div>
            </div>
        </div>
        
        <div className="col-md-6">
            <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
                <h3 className="text-muted small text-uppercase fw-bold mb-2">Total Delivered Orders</h3>
                <p className="text-3xl font-bold mb-0" style={{ color: "#0d6efd", fontSize: "2rem" }}>
                    {totalOrders}
                </p>
                <div className="mt-2 text-muted small">Based on ₹10 per order logic</div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
