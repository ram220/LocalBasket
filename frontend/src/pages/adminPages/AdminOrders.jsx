import { useEffect,useState } from "react";
import axios from "axios";

function AdminOrders(){

    const [orders,setOrders]=useState([]);
    const [currentPage,setCurrentPage]=useState(1);
    const [totalPages,setTotalPages]=useState(1);

    const [agents,setAgents] = useState([]);


    const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com"
    //const API_URL="http://localhost:8000";
    const token=localStorage.getItem("token");

    useEffect(()=>{

        const fetchOrders=async()=>{

            try{

                const res=await axios.get(`${API_URL}/api/admin/getAllOrders?page=${currentPage}`,{
                headers:{Authorization:`Bearer ${token}`}
                })

                setOrders(res.data.orders);
                setCurrentPage(res.data.currentPage);
                setTotalPages(res.data.totalPages);

            }
            catch(err){
                alert("error fetching admin orders")
            }

        }

        fetchOrders();
        fetchAgents();

    },[currentPage,token]);

    const handleOrderStatus = async(orderId,status)=>{
        try{

            await axios.patch(
            `${API_URL}/api/admin/updateOrderStatus`,
            {orderId,status},
            {headers:{Authorization:`Bearer ${token}`}}
            )

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId
                    ? {...order,orderStatus:status}
                    : order
                )
            )

        }
        catch(err){
            alert("Error updating order status")
        }
    }


    const fetchAgents = async()=>{
        const res = await axios.get(`${API_URL}/api/admin/getApprovedAgents`,{
            headers:{Authorization:`Bearer ${token}`}
        });

        setAgents(res.data.agents);
    };


    const handleAssignAgent = async(orderId,agentId)=>{
    try{

        await axios.post(`${API_URL}/api/admin/assignDeliveryAgent`,
            {orderId,agentId},
            {headers:{Authorization:`Bearer ${token}`}}
        )

        alert("Agent assigned successfully");

        // REFRESH ORDERS
        const res = await axios.get(`${API_URL}/api/admin/getAllOrders?page=${currentPage}`,{
        headers:{Authorization:`Bearer ${token}`}
        });

        setOrders(res.data.orders);

    }
    catch(err){
        alert("Error assigning agent");
    }
}


    return(

        <div className="container-fluid mt-2 px-3">

            <h4>
                <span style={{color:"rgb(252,107,3)"}}>All</span> Orders (Admin)
            </h4>

            {
                orders.length===0 ?
                    <p>No orders</p>
                :
                (
                <>

                    {
                        orders.map(order=>{

                            let vendorTotal={};

                            order.items.forEach(item=>{
                                const vendorName=item.productId?.vendorId?.shopName;

                                if(!vendorTotal[vendorName]) vendorTotal[vendorName]=0;

                                vendorTotal[vendorName]+=item.price*item.quantity;
                            })

                            return(

                                <div key={order._id} className="border p-3 mb-3 rounded">

                                    <h6>Order ID: {order._id}</h6>

                                    <p>User:
                                        <strong>
                                            {order.userId?.name} ({order.userId?.email})
                                        </strong>
                                    </p>

                                    <p>Mobile: <strong>{order.userId?.mobile}</strong></p>
                                    <p>Address: <strong>{order.userId?.address}</strong></p>

                                    <p>Payment Status: <strong>{order.paymentStatus}</strong></p>

                                   {
                                        !order.deliveryAgentId && (

                                            <div className="mb-3">
                                                <label><strong>Assign Delivery Agent</strong></label>

                                                <select
                                                    className="form-control"
                                                    onChange={(e)=>handleAssignAgent(order._id,e.target.value)}
                                                >

                                                    <option value="">Select Agent</option>

                                                        {agents.map(agent=>(
                                                        <option key={agent._id} value={agent._id}>
                                                        {agent.name}
                                                    </option>
                                                        ))}

                                                </select>

                                            </div>

                                        )
                                    }

                                    <p>Delivery Status:
                                        <span className={`badge ms-2 ${
                                        order.deliveryStatus === "Delivered"
                                            ? "bg-success"
                                            : order.deliveryStatus === "Out for Delivery"
                                            ? "bg-primary"
                                            : order.deliveryStatus === "Picked"
                                            ? "bg-warning text-dark"
                                            : order.deliveryStatus === "Assigned"
                                            ? "bg-info text-dark"
                                            : "bg-secondary"
                                        }`}>
                                            {order.deliveryStatus}
                                        </span>
                                    </p>


                                    <p>Delivery Agent:
                                        <strong>
                                            {order.deliveryAgentId
                                            ? `${order.deliveryAgentId.name} (${order.deliveryAgentId.mobile})`
                                            : "Not Assigned"}
                                        </strong>
                                    </p>
                                    
                                    <div className="mb-2">
                                        <label><strong>Order Status</strong></label>

                                        <select
                                            className="form-control w-100 w-md-25"
                                            value={order.orderStatus}
                                            disabled={order.orderStatus==="Cancelled"}
                                            onChange={(e)=>handleOrderStatus(order._id,e.target.value)}
                                        >
                                            <option value="Placed">Placed</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <p>
                                    Payment Method:
                                        <strong>
                                        {order.paymentMethod==="UPI" ? "UPI (Online)" : "Cash On Delivery"}
                                        </strong>
                                    </p>

                                    <p>Date: {new Date(order.createdAt).toLocaleString()}</p>

                                    <p>Total Amount: ₹{order.totalAmount}</p>

                                    <hr/>

                                    <h6>Products</h6>

                                    <div className="row">

                                        {
                                            order.items.map(item=>(

                                                <div key={item._id} className="col-12 col-md-6 d-flex align-items-center mb-2">

                                                    <img
                                                        src={item.productId?.image}
                                                        alt=""
                                                        style={{height:"60px",width:"60px",marginRight:"10px"}}
                                                    />

                                                    <div>

                                            <h6>{item.productId?.name}</h6>

                                            <small>

                                                Vendor:
                                                <strong>
                                                {item.productId?.vendorId?.shopName}
                                                </strong>

                                            </small>

                                            <br/>

                                            ₹{item.price} × {item.quantity}

                                            <br/>

                                            Subtotal: ₹{item.price*item.quantity}

                                            <br/>

                                            Item Status:
                                                <span className={`badge ms-2 ${
                                                    item.status === "Ready"
                                                    ? "bg-success"
                                                    : item.status === "Delayed"
                                                    ? "bg-warning text-dark"
                                                    : item.status === "Cancelled"
                                                    ? "bg-danger"
                                                    : "bg-secondary"
                                                }`}>
                                                {item.status}
                                            </span>
                                    </div>

                                </div>
                            ))
                        }

                    </div>

                    <hr/>

                    <h6>Vendor Earnings</h6>

                    {
                        Object.entries(vendorTotal).map(([vendor,total])=>(

                            <p key={vendor}>

                            <strong>{vendor}</strong> earned ₹{total}

                            </p>))
                    }

                </div>
                )})
            }

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

                </>

            )
            }

            </div>

    )

}

export default AdminOrders