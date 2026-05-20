import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import API_URL from "../../config";

// Sub-component to publish GPS coordinates dynamically when driving
function AgentLocationPublisher({ orderId }) {
    const socketRef = useRef(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        if (!orderId) return;

        socketRef.current = io(API_URL);
        socketRef.current.emit("join_order_room", { orderId });

        let agentId = "";
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                agentId = decoded.id;
            }
        } catch (e) {
            console.error("Error decoding token for agentId", e);
        }

        if (navigator.geolocation) {
            console.log(`🚴 Live tracking publisher started for Order: ${orderId}`);
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, heading } = position.coords;
                    socketRef.current.emit("update_agent_location", {
                        orderId,
                        agentId,
                        lat: latitude,
                        lng: longitude,
                        bearing: heading || 0
                    });
                },
                (error) => {
                    console.error("❌ GPS Tracking error:", error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }

        return () => {
            console.log(`🚴 Live tracking publisher stopped for Order: ${orderId}`);
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [orderId]);

    return (
        <div className="alert alert-success d-flex align-items-center mt-3 py-2 px-3 shadow-sm" role="alert" style={{ borderRadius: "8px" }}>
            <span className="spinner-grow spinner-grow-sm text-success me-2" role="status" aria-hidden="true" style={{ width: "12px", height: "12px" }} />
            <span className="small fw-bold">Live GPS Tracking Stream Active...</span>
        </div>
    );
}

function AgentOrders(){
    const [orders,setOrders] = useState([]);
    const [otpInputs, setOtpInputs] = useState({});
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

    const getDeviceLocation = () => {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve(`${position.coords.latitude},${position.coords.longitude}`);
                    },
                    (error) => {
                        console.warn("⚠️ Device location bypassed:", error.message);
                        resolve(null);
                    },
                    { enableHighAccuracy: true, timeout: 5000 }
                );
            } else {
                resolve(null);
            }
        });
    };

    const openGoogleMapsNavigation = async (order, type = "customer") => {
        const originCoords = await getDeviceLocation();
        const isAndroid = /Android/i.test(navigator.userAgent);

        if (type === "shop") {
            let destination = "";
            const shopCoords = order.pickupLocation?.coordinates;
            
            // Check if backend populated a real geocoded coordinate (not the default Vijayawada placeholder)
            if (shopCoords && shopCoords.length === 2 && (shopCoords[1] !== 16.5075 || shopCoords[0] !== 80.6475)) {
                destination = `${shopCoords[1]},${shopCoords[0]}`;
            } else {
                const firstItem = order.items?.[0];
                const vendorAddress = firstItem?.productId?.vendorId?.address || firstItem?.vendorId?.address;
                if (vendorAddress) {
                    destination = encodeURIComponent(vendorAddress);
                } else if (shopCoords && shopCoords.length === 2) {
                    destination = `${shopCoords[1]},${shopCoords[0]}`;
                } else {
                    destination = "16.5075,80.6475";
                }
            }

            if (isAndroid) {
                // Open native navigation intent directly without loading intermediate web page!
                window.location.href = `google.navigation:q=${destination}`;
            } else {
                const originParam = originCoords ? `&origin=${originCoords}` : "";
                window.open(`https://www.google.com/maps/dir/?api=1${originParam}&destination=${destination}`, "_blank");
            }
        } else {
            let destination = "";
            const userCoords = order.deliveryLocation?.coordinates;

            // Check if backend populated a real geocoded coordinate (not the default Vijayawada placeholder)
            if (userCoords && userCoords.length === 2 && (userCoords[1] !== 16.5062 || userCoords[0] !== 80.6480)) {
                destination = `${userCoords[1]},${userCoords[0]}`;
            } else if (order.userId?.address) {
                destination = encodeURIComponent(order.userId.address);
            } else if (userCoords && userCoords.length === 2) {
                destination = `${userCoords[1]},${userCoords[0]}`;
            } else {
                destination = "16.5062,80.6480";
            }

            if (isAndroid) {
                // Open native navigation intent directly without loading intermediate web page!
                window.location.href = `google.navigation:q=${destination}`;
            } else {
                const originParam = originCoords ? `&origin=${originCoords}` : "";
                window.open(`https://www.google.com/maps/dir/?api=1${originParam}&destination=${destination}`, "_blank");
            }
        }
    };


    const groupByVendor = (items) => {
        const grouped = {};

        items.forEach(item => {
            const vendorName = item.productId?.vendorId?.shopName || item.vendorId?.shopName || "Unknown Vendor";

            if (!grouped[vendorName]) {
                grouped[vendorName] = [];
            }

            grouped[vendorName].push(item);
        });

        return grouped;
    };

    const handleOtpChange = (orderId, value) => {
        setOtpInputs(prev => ({ ...prev, [orderId]: value }));
    };

    const updateStatus = async(orderId,status)=>{
        const otp = otpInputs[orderId];
        
        if(status === "Delivered" && (!otp || otp.length !== 4)){
            alert("Please enter the 4-digit OTP provided by the customer");
            return;
        }

        try {
            await axios.patch(`${API_URL}/api/agent/updateDeliveryStatus`,
            {orderId,status,otp},
            {headers:{Authorization:`Bearer ${token}`}});

            setOrders(prev =>
                prev.map(order =>
                    order._id === orderId
                    ? {...order,deliveryStatus:status}
                    : order
                )
            );
            
            if(status === "Delivered") {
                setOtpInputs(prev => {
                    const newState = {...prev};
                    delete newState[orderId];
                    return newState;
                });
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error updating status");
        }
    };

    const updatePayment = async(orderId)=>{
        try {
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
        } catch (err) {
            alert(err.response?.data?.message || "Error updating payment status");
        }
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

                orders.map(order => {

                    let vendorTotal={};

                    order.items.forEach(item=>{
                        const vendor = item.productId?.vendorId?.shopName || item.vendorId?.shopName || "Unknown Vendor";
                        if(!vendorTotal[vendor]) vendorTotal[vendor]=0;
                        vendorTotal[vendor]+=item.price*item.quantity;
                    });

                    return (
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
                            <p>
                                Total Amount: <strong>₹{order.totalAmount}</strong>
                            </p>
                        </div>

                        <hr/>

                        {/* PRODUCTS shop wise */}
                       <h6>Products (Shop-wise)</h6>

                        {
                            Object.entries(groupByVendor(order.items)).map(([vendor, items]) => (

                                <div key={vendor} className="mb-3 border rounded p-2">

                                    {/* VENDOR HEADER */}
                                    <h6 className="text-primary d-flex justify-content-between">
                                        <span>🏪 {vendor}</span>
                                        <span>₹{vendorTotal[vendor] || 0}</span>
                                    </h6>

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

                        {/* OTP INPUT */}
                        {order.deliveryStatus === "Out for Delivery" && (
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Enter Delivery OTP</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="4-digit OTP"
                                    maxLength="4"
                                    value={otpInputs[order._id] || ""}
                                    onChange={(e) => handleOtpChange(order._id, e.target.value)}
                                    style={{maxWidth: "150px"}}
                                />
                            </div>
                        )}

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

                            {order.deliveryStatus === "Assigned" && (
                                <button
                                    className="btn btn-outline-info"
                                    onClick={() => openGoogleMapsNavigation(order, "shop")}
                                >
                                    🗺️ Navigate to Shop
                                </button>
                            )}

                            {(order.deliveryStatus === "Picked" || order.deliveryStatus === "Out for Delivery") && (
                                <button
                                    className="btn btn-info text-white"
                                    onClick={() => openGoogleMapsNavigation(order, "customer")}
                                >
                                    🗺️ Navigate to Customer
                                </button>
                            )}

                        </div>

                        {/* LIVE GPS PUBLISHER STREAM */}
                        {(order.deliveryStatus === "Picked" || order.deliveryStatus === "Out for Delivery") && (
                            <AgentLocationPublisher orderId={order._id} />
                        )}

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

                    );
                })

            ) : (
                <p className="text-center">No Assigned Orders</p>
            )}

        </div>
    )
}

export default AgentOrders;