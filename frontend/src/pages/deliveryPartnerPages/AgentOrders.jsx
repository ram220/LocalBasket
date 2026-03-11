import {useEffect,useState} from "react";
import axios from "axios";

function AgentOrders(){

    const [orders,setOrders] = useState([]);
    const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";

    //const API_URL="http://localhost:8000";
    const token=localStorage.getItem("token");

    useEffect(()=>{

        const fetchOrders = async()=>{
            try{

                const res = await axios.get(`${API_URL}/api/agent/getAgentOrders`,{
                headers:{Authorization:`Bearer ${token}`}
                });
                setOrders(res.data.orders);

            }
            catch(err){
                const message=err.response?.data.message || "Something went wrong while fetching orders"
                alert(message);
            }
        }

        fetchOrders();

    },[])


    const updateStatus = async(orderId,status)=>{
        try{

            await axios.patch(
                `${API_URL}/api/agent/updateDeliveryStatus`,
                {orderId,status},
                {headers:{Authorization:`Bearer ${token}`}}
            )

            // update UI instantly
            setOrders(prev =>
                prev.map(order =>
                    order._id === orderId
                    ? {...order,deliveryStatus:status}
                    : order
                )
            )

        }
        catch(err){
            alert("Error updating delivery status")
        }
    }


    const updatePayment = async(orderId)=>{
        try{

            await axios.patch(
                `${API_URL}/api/agent/updatePaymentStatus`,
                {orderId},
                {headers:{Authorization:`Bearer ${token}`}}
            )

            setOrders(prev =>
                prev.map(order =>
                    order._id === orderId
                    ? {...order,paymentStatus:"Completed"}
                    : order
                )
            )

        }
        catch(err){
            alert("Error updating payment status")
        }
    }

    return(

        <div className="container">

            <h4>My Assigned Orders</h4>

            {
                orders?.length > 0 ? (
                    orders.map(order=>(
                    <div key={order._id} className="border p-3 mb-3 rounded">

                        <h6>Order ID: {order._id}</h6>

                        <p>Customer: {order.userId?.name}</p>

                        <p>Mobile: {order.userId?.mobile}</p>

                        <p>Address: {order.userId?.address}</p>

                        <p>Delivery Status:<span className="badge bg-info ms-2">{order.deliveryStatus}</span></p>
                        
                        <p>Payment Method:<strong className="ms-2">{order.paymentMethod}</strong></p>

                        <p>Payment Status:<span className={`badge ms-2 ${order.paymentStatus==="Completed" ? "bg-success" : "bg-danger"}`}>{order.paymentStatus}</span></p>                     
                        
                        <h6>Products</h6>

                        {
                            order.items?.map(item => (
                            <div key={item._id} className="d-flex align-items-start mb-3">

                                <img
                                src={item.productId?.image}
                                alt=""
                                style={{ height: "50px", width: "50px", marginRight: "10px" }}
                                />

                                <div>

                                <strong>{item.productId?.name}</strong>

                                <br/>

                                <small>
                                    Vendor: <strong>{item.vendorId?.shopName}</strong>
                                </small>

                                <br/>

                                <small>
                                    Vendor Modile: <strong>{item.vendorId?.mobile}</strong>
                                </small>

                                <br/>

                                <small>
                                    Vendor Address: {item.vendorId?.address}
                                </small>

                                <br/>

                                <small>
                                    Quantity: {item.quantity}
                                </small>

                                </div>

                            </div>
                            ))
                        }


                        <div className="mt-3">

                            <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={()=>updateStatus(order._id,"Picked")}
                            disabled={order.deliveryStatus!=="Assigned"}
                            >
                            Picked
                            </button>

                            <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={()=>updateStatus(order._id,"Out for Delivery")}
                            disabled={order.deliveryStatus!=="Picked"}
                            >
                            Out for Delivery
                            </button>

                            <button
                            className="btn btn-success btn-sm"
                            onClick={()=>updateStatus(order._id,"Delivered")}
                            disabled={order.deliveryStatus!=="Out for Delivery"}
                            >
                            Delivered
                            </button>

                        </div>

                        {
order.paymentMethod === "COD" &&
order.paymentStatus !== "Completed" &&
order.deliveryStatus === "Delivered" && (

<button
className="btn btn-dark btn-sm mt-2"
onClick={()=>updatePayment(order._id)}
>
Mark Payment Received
</button>

)
}

                </div>
                ))
            ) : (<p>No assigned orders</p>)
            }

    </div>

    )

}

export default AgentOrders;