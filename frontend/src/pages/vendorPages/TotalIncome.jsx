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

function TotalIncome() {
  const [data, setData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";
  //const API_URL = "http://localhost:8000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/vendor/income`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const chartData = (res.data.monthlyIncome || []).map(item => ({
          month: `${item._id.month}-${item._id.year}`,
          totalIncome: item.totalIncome,
        }));

        setData(chartData);
        setTotalIncome(res.data.totalIncome || 0);

      } catch (err) {
        console.error("Error fetching income:", err);
      }
    };

    fetchIncome();
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Vendor Monthly Income
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalIncome" fill="#fa6704ff" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow">
        <h3 className="text-lg font-medium">Total Income</h3>
        <p className="text-2xl font-bold text-green-600">
          ₹ {totalIncome}
        </p>
      </div>
    </div>
  );
}

export default TotalIncome;