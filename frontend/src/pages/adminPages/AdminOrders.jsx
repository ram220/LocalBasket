import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function AdminOrders() {

    const [orders,setOrders]=useState([]);
    const [currentPage,setCurrentPage]=useState(1);
    const [totalPages,setTotalPages]=useState(1);
    const [agents,setAgents] = useState([]);

    const token=localStorage.getItem("token");

    useEffect(()=>{
        fetchOrders();
        fetchAgents();
    },[currentPage]);

    const fetchOrders = async ()=>{
        try{
            const res=await axios.get(`${API_URL}/api/admin/getAllOrders?page=${currentPage}`,{
                headers:{Authorization:`Bearer ${token}`}
            });

            setOrders(res.data.orders);
            setCurrentPage(res.data.currentPage);
            setTotalPages(res.data.totalPages);

        }catch{
            alert("Error fetching orders");
        }
    };

    const fetchAgents = async()=>{
        const res = await axios.get(`${API_URL}/api/admin/getApprovedAgents`,{
            headers:{Authorization:`Bearer ${token}`}
        });
        setAgents(res.data.agents);
    };

    const handleOrderStatus = async(orderId,status)=>{
        await axios.patch(`${API_URL}/api/admin/updateOrderStatus`,
        {orderId,status},
        {headers:{Authorization:`Bearer ${token}`}});

        fetchOrders();
    };

    const handleAssignAgent = async(orderId,agentId)=>{
        await axios.post(`${API_URL}/api/admin/assignDeliveryAgent`,
        {orderId,agentId},
        {headers:{Authorization:`Bearer ${token}`}});

        fetchOrders();
    };

    const badgeColor = (status)=>{
        if(status==="Delivered") return "bg-success";
        if(status==="Out for Delivery") return "bg-primary";
        if(status==="Picked") return "bg-warning text-dark";
        if(status==="Assigned") return "bg-info text-dark";
        if(status==="Cancelled") return "bg-danger";
        return "bg-secondary";
    };

    return (
        <div className="container mt-4">

            <h3 className="text-center mb-4" style={{color:"#fc6b03"}}>
                Admin Orders
            </h3>

            {orders.length === 0 ? (
                <p>No Orders</p>
            ) : (

                orders.map(order => {

                    let vendorTotal={};

                    order.items.forEach(item=>{
                        const vendor=item.productId?.vendorId?.shopName;
                        if(!vendorTotal[vendor]) vendorTotal[vendor]=0;
                        vendorTotal[vendor]+=item.price*item.quantity;
                    });

                    return (

                        <div key={order._id} className="card shadow-lg mb-4 p-3">

                            {/* HEADER */}
                            <div className="d-flex justify-content-between flex-wrap">
                                <h6>Order ID: {order._id}</h6>
                                <span className={`badge ${badgeColor(order.deliveryStatus)}`}>
                                    {order.deliveryStatus}
                                </span>
                            </div>

                            <hr/>

                            {/* USER INFO */}
                            <div className="row">
                                <div className="col-md-6">
                                    <h6>User Details</h6>
                                    <p><strong>{order.userId?.name}</strong></p>
                                    <p>{order.userId?.email}</p>
                                    <p>{order.userId?.mobile}</p>
                                    <p>{order.userId?.address}</p>
                                </div>

                                {/* PAYMENT */}
                                <div className="col-md-6">
                                    <h6>Payment</h6>
                                    <p>Status: <span className="badge bg-success">{order.paymentStatus}</span></p>
                                    <p>Method: <strong>{order.paymentMethod}</strong></p>
                                    <p>Total: <strong>₹{order.totalAmount}</strong></p>
                                </div>
                            </div>

                            <hr/>

                            {/* AGENT */}
                            <div className="mb-3">
                                <h6>Delivery Agent</h6>

                                {order.deliveryAgentId ? (
                                    <p className="badge bg-info text-dark">
                                        {order.deliveryAgentId.name} ({order.deliveryAgentId.mobile})
                                    </p>
                                ) : (
                                    <select
                                        className="form-select"
                                        onChange={(e)=>handleAssignAgent(order._id,e.target.value)}
                                    >
                                        <option value="">Assign Agent</option>
                                        {agents.map(a=>(
                                            <option key={a._id} value={a._id}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* ORDER STATUS */}
                            <div className="mb-3">
                                <h6>Order Status</h6>
                                <select
                                    className="form-select w-50"
                                    value={order.orderStatus}
                                    onChange={(e)=>handleOrderStatus(order._id,e.target.value)}
                                >
                                    <option>Placed</option>
                                    <option>Shipped</option>
                                    <option>Delivered</option>
                                    <option>Cancelled</option>
                                </select>
                            </div>

                            <hr/>

                            {/* PRODUCTS */}
                            <h6>Products</h6>

                            {order.items.map(item=>(
                                <div key={item._id} className="d-flex align-items-center mb-2 border rounded p-2">

                                    <img src={item.productId?.image}
                                        style={{height:"60px",width:"60px",borderRadius:"8px"}}
                                    />

                                    <div className="ms-3">
                                        <h6>{item.productId?.name}</h6>

                                        <small>
                                            Vendor: <strong>{item.productId?.vendorId?.shopName}</strong>
                                        </small>

                                        <br/>

                                        ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}

                                        <br/>

                                        <span className={`badge ${badgeColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>

                                </div>
                            ))}

                            <hr/>

                            {/* VENDOR EARNINGS */}
                            <h6>Vendor Earnings</h6>

                            {Object.entries(vendorTotal).map(([vendor,total])=>(
                                <p key={vendor}>
                                    <strong>{vendor}</strong>: ₹{total}
                                </p>
                            ))}

                            <small className="text-muted">
                                {new Date(order.createdAt).toLocaleString()}
                            </small>

                        </div>
                    )
                })
            )}

            {/* PAGINATION */}
            <div className="d-flex justify-content-between mt-3">

                <button
                    className="btn btn-primary"
                    onClick={()=>setCurrentPage(prev=>Math.max(prev-1,1))}
                    disabled={currentPage===1}
                >
                    Previous
                </button>

                <span>Page {currentPage} of {totalPages}</span>

                <button
                    className="btn btn-primary"
                    onClick={()=>setCurrentPage(prev=>Math.min(prev+1,totalPages))}
                    disabled={currentPage===totalPages}
                >
                    Next
                </button>
            </div>

        </div>
    );
}

export default AdminOrders;