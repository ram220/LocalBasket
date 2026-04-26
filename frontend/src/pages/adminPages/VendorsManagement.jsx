import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function VendorsManagement() {
    const [vendors, setVendors] = useState([]);
    const token = localStorage.getItem("token");

    const fetchVendors = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/getAllVendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendors(res.data.vendors);
        } catch (err) {
            alert("Error fetching vendors");
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const approveVendor = async (id) => {
        await axios.patch(`${API_URL}/api/admin/approveVendor/${id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchVendors();
    };

    const rejectVendor = async (id) => {
        await axios.patch(`${API_URL}/api/admin/rejectVendor/${id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchVendors();
    };

    const deleteVendor = async (id) => {
        await axios.delete(`${API_URL}/api/admin/deleteVendor/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchVendors();
    };

    const activateVendor = async (id) => {
        await axios.patch(`${API_URL}/api/admin/activateSubscription/${id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchVendors();
    };

    const getStatusBadge = (status) => {
        if (status === "approved") return "badge bg-success";
        if (status === "pending") return "badge bg-warning text-dark";
        if (status === "reject") return "badge bg-danger";
        return "badge bg-secondary";
    };

    return (
        <div className="container mt-4">

            <div className="card shadow-lg p-3">
                <h3 className="mb-4 text-center" style={{ color: "#fc6b03" }}>
                    Vendor Management
                </h3>

                {vendors.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle text-center">

                            <thead className="table-dark">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Plan</th>
                                    <th>Days Left</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {vendors.map((v) => (
                                    <tr key={v._id}>

                                        <td className="fw-bold">{v.name}</td>

                                        <td>{v.email}</td>

                                        <td>
                                            <span className={getStatusBadge(v.status)}>
                                                {v.status}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="badge bg-info text-dark">
                                                {v.subscriptionStatus || "inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            {v.daysLeft !== undefined ? (
                                                <span className="badge bg-primary">
                                                    {v.daysLeft} days
                                                </span>
                                            ) : "-"}
                                        </td>

                                        <td>
                                            <div className="d-flex flex-wrap justify-content-center gap-2">

                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => approveVendor(v._id)}
                                                >
                                                    ✔ Approve
                                                </button>

                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => rejectVendor(v._id)}
                                                >
                                                    ⚠ Reject
                                                </button>

                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => activateVendor(v._id)}
                                                >
                                                    💳 Activate
                                                </button>

                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => deleteVendor(v._id)}
                                                >
                                                    🗑 Delete
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                ) : (
                    <p className="text-center">No Vendors Found</p>
                )}
            </div>
        </div>
    );
}

export default VendorsManagement;