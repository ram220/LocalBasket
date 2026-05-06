import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function MyOrders() {
  const [orders,setOrders]=useState([]);
  

  const token=localStorage.getItem("token")

  useEffect(()=>{
    if(!token){
      return;
    }
    const fetchOrders=async()=>{
      try{
        const res=await axios.get(`${API_URL}/api/user/orders`,{
          headers:{Authorization:`Bearer ${token}`}
        })

        setOrders(res.data.orders);
      }
      catch(err){
        const message=err.response?.data.message || "something went wrong while fetching your orders";
        alert(message);
      }
    }
    fetchOrders();
  },[token])

  const cancelOrder=async(orderId)=>{
    try{
      const res=await axios.put(`${API_URL}/api/user/cancelOrder/${orderId}`,{},{
        headers:{Authorization: `Bearer ${token}`}
      });

      alert(res.data.message);

      setOrders(prev=>
        prev.map(o=>o._id === orderId ? {...o,orderStatus:"Cancelled"} : o) 
      );
    }
    catch(err){
      alert(err.response?.data?.message || "Error cancelling order");
    }
  }

  const canCancelOrder = (createdAt) => {
  const orderTime = new Date(createdAt);
  const currentTime = new Date();

  const diffMinutes = (currentTime - orderTime) / (1000 * 60);

  return diffMinutes < 10;
};

  return (
    <div className="container mt-5 p-3">
      <h4>
        <span style={{ color: "rgb(252, 107, 3)" }}>My</span> Orders
      </h4>

      <div className="alert alert-warning mt-3 shadow-sm border-warning" role="alert" style={{ borderRadius: "8px" }}>
        <strong>⚠️ Caution:</strong> As we are currently using a free-tier database (MongoDB), your order history will be automatically deleted every month. Please take note of this!
      </div>

      {orders.some(order => order.deliveryStatus === "Pending") && (
        <div className="alert alert-info mt-3 shadow-sm border-info" role="alert" style={{ borderRadius: "8px", backgroundColor: "#e3f2fd", color: "#0d47a1" }}>
          <strong>ℹ️ Notice:</strong> Our delivery agents are currently busy handling other orders. Your order is in queue and will be assigned shortly. Thank you for your patience!
        </div>
      )}
      {
        orders.length === 0 ? ( <p className="mt-3">You have no orders yet.</p>
          ) : (
            orders.map((order)=>(
              <div key={order._id} className="border p-3 mb-3 rounded">
                <h6>Order ID: {order._id}</h6>
                <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
                <p>Amount: ₹{order.itemsTotal}</p>
                <p>Delivery Charge: ₹{order.deliveryCharge}</p>
                <p>Total Amount: ₹{order.totalAmount}</p>
                <p>Payment Status: {order.paymentStatus}</p>
                <p>Order Status: {order.orderStatus}</p>
                <p>
Delivery Status:
<strong style={{marginLeft:"5px"}}>
{order.deliveryStatus}
</strong>
</p>
                 <p>
Delivery Agent:
<strong>
{order.deliveryAgentId
  ? `${order.deliveryAgentId.name} (${order.deliveryAgentId.mobile})`
  : order.deliveryStatus === "Pending" ? "Waiting for Agent (Busy)" : "Not Assigned Yet"}
</strong>
</p>
{order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
  <p className="p-2 rounded" style={{backgroundColor: "#fff3cd", border: "1px solid #ffeeba", display: "inline-block"}}>
    🔑 Delivery OTP: <strong>{order.deliveryOTP}</strong>
    <br/>
    <small className="text-muted">Share this only with the agent at delivery.</small>
  </p>
)}
                <p>Payment Method: <strong style={{marginLeft: "5px"}}>
                  {order.paymentMethod === "UPI" ? "UPI (Online)" : "Cash On Delivery"}</strong>
                </p>
                <div className="d-flex justify-content-between align-items-center mt-2">

  <div>
    <span className={`badge ${
      order.orderStatus === "Cancelled"
        ? "bg-danger"
        : order.orderStatus === "Delivered"
        ? "bg-success"
        : "bg-warning text-dark"
    }`}>
      {order.orderStatus}
    </span>
  </div>

  <button
    className="btn btn-outline-danger btn-sm"
    disabled={
      order.orderStatus === "Cancelled" ||
      order.orderStatus === "Delivered" ||
      order.deliveryStatus === "Delivered" ||
      !canCancelOrder(order.createdAt)
    }
    onClick={()=>cancelOrder(order._id)}
  >
    {order.orderStatus === "Cancelled"
    ? "Cancelled"
    : order.orderStatus === "Delivered" || order.deliveryStatus === "Delivered"
    ? "Delivered"
    : !canCancelOrder(order.createdAt)
    ? "Cancel Expired"
    : "Cancel Order"}
  </button>

</div>

                <div className="row border-top pt-2">
                    {
                      (order.items || []).map((item)=>(
                        <div key={item._id} className="col-md-6 d-flex align-items-center mb-2">
                          <img src={item.image} alt={item.name} style={{height:"60px",width:"60px",marginRight:"10px"}}/>
                        
                          <div>
                            <h6 className="mb-1">{item.name}</h6>
                            <small>₹{item.price} x {item.quantity}</small><br/>
                            <strong>Subtotal: ₹{item.price * item.quantity}</strong>
                          </div>
                        </div>
                      ))
                    }
                </div>
              </div>
            ))
          )
      }
      
    </div>
  );
}

export default MyOrders;
