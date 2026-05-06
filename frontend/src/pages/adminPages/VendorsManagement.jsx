import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function VendorsManagement() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/admin/getAllVendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendors(res.data.vendors);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const approveVendor = async (id) => {
        try {
            await axios.patch(`${API_URL}/api/admin/approveVendor/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVendors();
        } catch (err) {
            alert("Error approving vendor");
        }
    };

    const rejectVendor = async (id) => {
        try {
            await axios.patch(`${API_URL}/api/admin/rejectVendor/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVendors();
        } catch (err) {
            alert("Error rejecting vendor");
        }
    };

    const deleteVendor = async (id) => {
        if (window.confirm("Are you sure you want to delete this vendor?")) {
            try {
                await axios.delete(`${API_URL}/api/admin/deleteVendor/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchVendors();
            } catch (err) {
                alert("Error deleting vendor");
            }
        }
    };

    const activateVendor = async (id) => {
        try {
            await axios.patch(`${API_URL}/api/admin/activateSubscription/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVendors();
        } catch (err) {
            alert("Error activating subscription. Make sure the vendor is approved first.");
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case "approved": return { bg: "#e6fcf5", color: "#087f5b" };
            case "pending": return { bg: "#fff9db", color: "#f08c00" };
            case "rejected": return { bg: "#fff5f5", color: "#c92a2a" };
            default: return { bg: "#f1f3f5", color: "#495057" };
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0" style={{ color: "rgb(255, 107, 2)" }}>Vendor Management</h2>
                <span className="badge bg-light text-dark border p-2">{vendors.length} Total Vendors</span>
            </div>

            {/* Desktop Table View */}
            <div className="card shadow-sm border-0 d-none d-lg-block" style={{ borderRadius: "16px", overflow: "hidden" }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3">Vendor</th>
                                <th className="py-3">Email</th>
                                <th className="py-3 text-center">Status</th>
                                <th className="py-3 text-center">Subscription</th>
                                <th className="py-3 text-center">Days Left</th>
                                <th className="py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map((v) => {
                                const styles = getStatusStyles(v.status);
                                return (
                                    <tr key={v._id}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar-circle me-3" style={{ backgroundColor: "rgba(255, 107, 2, 0.1)", color: "rgb(255, 107, 2)" }}>
                                                    {v.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="fw-bold">{v.name}</div>
                                                    <div className="text-muted small">{v.shopName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">{v.email}</td>
                                        <td className="py-3 text-center">
                                            <span className="badge rounded-pill px-3" style={{ backgroundColor: styles.bg, color: styles.color }}>
                                                {(v.status || "pending").toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className="badge bg-light text-dark border-0">
                                                {v.subscriptionStatus || "inactive"}
                                            </span>
                                        </td>
                                        <td className="py-3 text-center">
                                            {v.daysLeft !== undefined ? (
                                                <span className={`fw-bold ${v.daysLeft < 5 ? 'text-danger' : 'text-primary'}`}>
                                                    {v.daysLeft} d
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td className="py-3 text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                {v.status !== "approved" && (
                                                    <button className="btn btn-sm btn-success rounded-3" onClick={() => approveVendor(v._id)}>Approve</button>
                                                )}
                                                {v.status !== "rejected" && (
                                                    <button className="btn btn-sm btn-warning rounded-3" onClick={() => rejectVendor(v._id)}>Reject</button>
                                                )}
                                                {v.status === "approved" && (
                                                    <button className="btn btn-sm btn-primary rounded-3" onClick={() => activateVendor(v._id)}>Extend</button>
                                                )}
                                                <button className="btn btn-sm btn-outline-danger border-0 rounded-circle" onClick={() => deleteVendor(v._id)}>✕</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="d-lg-none">
                {vendors.map((v) => {
                    const styles = getStatusStyles(v.status);
                    return (
                        <div key={v._id} className="card shadow-sm border-0 mb-3 p-3" style={{ borderRadius: "16px" }}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center">
                                    <div className="avatar-circle-sm me-2" style={{ backgroundColor: "rgba(255, 107, 2, 0.1)", color: "rgb(255, 107, 2)" }}>
                                        {v.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="fw-bold">{v.name}</div>
                                        <div className="text-muted small">{v.email}</div>
                                    </div>
                                </div>
                                <span className="badge rounded-pill px-3" style={{ backgroundColor: styles.bg, color: styles.color }}>
                                    {v.status}
                                </span>
                            </div>

                            <div className="d-flex justify-content-between mb-3 bg-light p-2 rounded-3">
                                <div className="small">
                                    <span className="text-muted">Plan: </span>
                                    <span className="fw-bold">{v.subscriptionStatus || "None"}</span>
                                </div>
                                <div className="small">
                                    <span className="text-muted">Remaining: </span>
                                    <span className="fw-bold text-primary">{v.daysLeft} days</span>
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                {v.status !== "approved" && (
                                    <button className="btn btn-success btn-sm flex-grow-1" onClick={() => approveVendor(v._id)}>Approve</button>
                                )}
                                {v.status === "approved" && (
                                    <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => activateVendor(v._id)}>Extend</button>
                                )}
                                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteVendor(v._id)}>Delete</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {vendors.length === 0 && (
                <div className="text-center py-5">
                    <p className="text-muted">No vendors found</p>
                </div>
            )}

            <style>{`
                .avatar-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }
                .avatar-circle-sm {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 0.8rem;
                }
                .table-hover tbody tr:hover {
                    background-color: #fafafa;
                }
                .badge {
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }
            `}</style>
        </div>
    );
}

export default VendorsManagement;