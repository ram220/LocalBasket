import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function AgentOrders(){
    const [orders,setOrders] = useState([]);
    const token=localStorage.getItem("token");

    useEffect(()=>{
        fetchOrders();
    },[]);

    const fetchOrders = async()=>{
        try{
            const res = await axios.get(`${API_URL}/api/agent/getAgentOrders`,{
                headers:{Authorization:`Bearer ${token}`}
            });
            setOrders(res.data.orders);
        }catch(err){
            alert("Error fetching orders");
        }
    };


    const groupByVendor = (items) => {
        const grouped = {};

        items.forEach(item => {
            const vendorName = item.vendorId?.shopName;

            if (!grouped[vendorName]) {
                grouped[vendorName] = [];
            }

            grouped[vendorName].push(item);
        });

        return grouped;
    };

    const updateStatus = async(orderId,status)=>{
        await axios.patch(`${API_URL}/api/agent/updateDeliveryStatus`,
        {orderId,status},
        {headers:{Authorization:`Bearer ${token}`}});

        setOrders(prev =>
            prev.map(order =>
                order._id === orderId
                ? {...order,deliveryStatus:status}
                : order
            )
        );
    };

    const updatePayment = async(orderId)=>{
        await axios.patch(`${API_URL}/api/agent/updatePaymentStatus`,
        {orderId},
        {headers:{Authorization:`Bearer ${token}`}});

        setOrders(prev =>
            prev.map(order =>
                order._id === orderId
                ? {...order,paymentStatus:"Completed"}
                : order
            )
        );
    };

    const badgeColor = (status)=>{
        if(status==="Assigned") return "bg-secondary";
        if(status==="Picked") return "bg-warning text-dark";
        if(status==="Out for Delivery") return "bg-primary";
        if(status==="Delivered") return "bg-success";
        return "bg-dark";
    };

    return(

        <div className="container mt-4">

            <h3 className="text-center mb-4" style={{color:"#fc6b03"}}>
                My Assigned Orders
            </h3>

            {orders.length > 0 ? (

                orders.map(order => (

                    <div key={order._id} className="card shadow-lg mb-4 p-3">

                        {/* HEADER */}
                        <div className="d-flex justify-content-between">
                            <h6>Order ID: {order._id}</h6>
                            <span className={`badge ${badgeColor(order.deliveryStatus)}`}>
                                {order.deliveryStatus}
                            </span>
                        </div>

                        <hr/>

                        {/* CUSTOMER */}
                        <div>
                            <h6>Customer</h6>
                            <p className="mb-1"><strong>{order.userId?.name}</strong></p>
                            <p className="mb-1">📞 {order.userId?.mobile}</p>
                            <p className="mb-1">📍 {order.userId?.address}</p>
                        </div>

                        <hr/>

                        {/* PAYMENT */}
                        <div>
                            <h6>Payment</h6>
                            <p>
                                Method: <strong>{order.paymentMethod}</strong>
                            </p>

                            <p>
                                Status:
                                <span className={`badge ms-2 ${
                                    order.paymentStatus==="Completed" ? "bg-success" : "bg-danger"
                                }`}>
                                    {order.paymentStatus}
                                </span>
                            </p>
                        </div>

                        <hr/>

                        {/* PRODUCTS shop wise */}
                       <h6>Products (Shop-wise)</h6>

                        {
                            Object.entries(groupByVendor(order.items)).map(([vendor, items]) => (

                                <div key={vendor} className="mb-3 border rounded p-2">

                                    {/* VENDOR HEADER */}
                                    <h6 className="text-primary">🏪 {vendor}</h6>

                                    {items.map(item => (

                                        <div key={item._id} className="d-flex mb-2">

                                            <img
                                                src={item.productId?.image}
                                                style={{height:"50px",width:"50px",borderRadius:"6px"}}
                                            />

                                            <div className="ms-2">

                                                <strong>{item.productId?.name}</strong>

                                                <br/>

                                                <small>Qty: {item.quantity}</small>

                                            </div>

                                        </div>

                                    ))}

                                </div>
                            ))
                        }

                        <hr/>

                        {/* ACTION BUTTONS */}
                        <div className="d-flex flex-wrap gap-2">

                            <button
                                className="btn btn-warning"
                                onClick={()=>updateStatus(order._id,"Picked")}
                                disabled={order.deliveryStatus!=="Assigned"}
                            >
                                Picked
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={()=>updateStatus(order._id,"Out for Delivery")}
                                disabled={order.deliveryStatus!=="Picked"}
                            >
                                Out for Delivery
                            </button>

                            <button
                                className="btn btn-success"
                                onClick={()=>updateStatus(order._id,"Delivered")}
                                disabled={order.deliveryStatus!=="Out for Delivery"}
                            >
                                Delivered
                            </button>

                        </div>

                        {/* COD BUTTON */}
                        {
                            order.paymentMethod === "COD" &&
                            order.paymentStatus !== "Completed" &&
                            order.deliveryStatus === "Delivered" && (

                                <button
                                    className="btn btn-dark mt-3 w-100"
                                    onClick={()=>updatePayment(order._id)}
                                >
                                    💰 Mark Payment Received
                                </button>
                            )
                        }

                    </div>

                ))

            ) : (
                <p className="text-center">No Assigned Orders</p>
            )}

        </div>
    )
}

export default AgentOrders;