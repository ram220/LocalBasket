import { useEffect, useState } from "react";
import axios from "axios";

function ViewOrders() {
    const [orders,setOrders]=useState([]);
    const [currentPage,setCurrentPage]=useState(1)
    const [totalPages,setTotalPages]=useState(1);

    const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";
    //const API_URL = "http://localhost:8000";
    const token=localStorage.getItem("token");

    useEffect(()=>{
        const fetchOrders = async()=>{
            try{
                const res=await axios.get(`${API_URL}/api/vendor/getOrders?page=${currentPage}`,{
                    headers:{Authorization:`Bearer ${token}`}
                })


                setOrders(res.data.orders);
                setCurrentPage(res.data.currentPage);
                setTotalPages(res.data.totalPages);
            }
            catch(err){
                const message=err.response?.data.message || "something went wrong while fetching orders";
                alert(message);
            }
        }
        fetchOrders();
    },[currentPage])

    const handleOrderStatus=async(orderId,itemId,status)=>{
        try{
            await axios.patch(`${API_URL}/api/vendor/update_item_status`,{
                orderId,
                itemId,
                status
            },{
                headers:{Authorization: `Bearer ${token}`}
            })
            // ✅ Update UI instantly (no refresh needed)
            setOrders(prevOrders =>
                prevOrders.map(order => {
                    if (order._id !== orderId) return order;

                    return {
                        ...order,
                        items: order.items.map(item => {
                            if (item._id === itemId) {
                                return { ...item, status }; // update only this item
                            }
                            return item;
                        })
                    };
                })
            );
        }
        catch(err){
            const message = err.response?.data.message || "Something went wrong while updating status";
            alert(message);
        }
    }
  
  return (
    <div className="container mt-1 p-1">
        <h4>
            <span style={{ color: "rgb(252, 107, 3)" }}>All</span> Orders
        </h4>

        {
            orders.length === 0 ? (
                <p className="mt-3">No Orders yet.</p>
            ) : (
                <>
                    { 
                        orders.map((order)=> (
                            <div key={order._id} className="border p-3 mb-3 rounded">
                                <h6>Order ID: {order._id}</h6>
                                <p>User: <strong>{order.userId?.name} ({order.userId?.email})</strong></p>
                                <p>Address: <strong>{order.userId?.address}</strong></p>
                                <p>Mobile: <strong>{order.userId?.mobile}</strong></p>
                                <p>Payment Status: <strong>{order.paymentStatus}</strong></p>
                                <p>Order Status: <strong>{order.orderStatus}</strong></p>

                                <p>
                                    Payment Method:
                                    <strong style={{ marginLeft: "5px" }}>
                                        {order.paymentMethod === "UPI" ? "UPI (Online)" : "Cash On Delivery"}
                                    </strong>
                                </p>

                                <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
                                <p>Total Amount: ₹{order.totalAmount}</p>

                                <div className="row border-top pt-2">
                                    {order.items.map((item) => (
                                        <div key={item._id} className="col-md-6 d-flex align-items-center mb-2">
                                            <img
                                            src={item.productId?.image}
                                            alt={item.productId?.name}
                                            style={{ height: "60px", width: "60px", marginRight: "10px" }}
                                            />
                                            <div>
                                            <h6 className="mb-1">{item.productId?.name}</h6>
                                            <small>₹{item.price} × {item.quantity}</small><br />
                                            <strong>Subtotal: ₹{item.price * item.quantity}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {order.items.map((item) => (
                                    <div key={item._id}>
                                        
                                        {/* existing UI */}

                                        <select
                                        value={item.status}
                                        onChange={(e) => handleOrderStatus(order._id, item._id, e.target.value)}
                                        >
                                        <option value="Placed">Placed</option>
                                        <option value="Ready">Ready</option>
                                        <option value="Delayed">Delayed</option>
                                        <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        ))
                    }

                    {/* pagination */}

                    <div className="d-flex justify-content-between mt-3">
                        <button
                            className="btn btn-primary"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            >
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            className="btn btn-primary"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            >
                            Next
                        </button>
                    </div>
                </>
            )
        }
    </div>
  );
}

export default ViewOrders;
