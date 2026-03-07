import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function OrderSummary({ cart,setCart }) {

  const [address,setAddress]=useState("");
  const [mobile,setMobile]=useState("");

  const navigate=useNavigate()
  
  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com"
  //const API_URL = "http://localhost:8000";

  const [paymentMethod,setPaymentMethod] = useState("COD");

  const DELIVERY_CHARGE = 0;

  const token=localStorage.getItem("token");

  useEffect(()=>{
    const fetchUserDeatils=async()=>{
      if(!token){
        return;
      }
      try{
        const res=await axios.get(`${API_URL}/api/user/get_user_details`,{
          headers:{Authorization:`Bearer ${token}`}
        })

        setAddress(res.data.address);
        setMobile(res.data.mobile);
      }
      catch(err){
        const message=err.response?.data.message || "something went wrong while fetching your address";
        alert(message)
      }
    }
    fetchUserDeatils();
  },[token])

  const itemsTotal = cart.reduce((total,item)=>{
    return total + item.finalPrice * item.quantity;
  },0);

  const total = itemsTotal + DELIVERY_CHARGE;

  const handlePlaceOrder = async()=>{
    if(cart.length === 0){
        alert("Cart is empty, add items to cart and try");
        return;
    }

    const orderData = {
        items: cart.map(item=>({
            productId:item.productId._id,
            quantity:item.quantity,
            price:item.finalPrice,
            image:item.productId.image,
            vendorId:item.vendorId._id  
        })),
        itemsTotal,
        deliveryCharge: DELIVERY_CHARGE,
        totalAmount: total,
        paymentMethod
    };
    try{
      if(paymentMethod==="COD"){
        await axios.post(`${API_URL}/api/orders/placeOrder`,orderData,{
          headers:{Authorization: `Bearer ${token}`}
        });

        alert("Order placed Successfully");
        setCart([]);

        return
      }
      if(paymentMethod==="UPI"){
        const razorOrder=await axios.post(`${API_URL}/api/orders/create-razorpay-order`,
          {amount:total},
          {headers:{Authorization:`Bearer ${token}`}}
        );

        
        const options={
          key:"rzp_live_RMI6AqNDqxjfS8",
          amount:razorOrder.data.amount,
          currency:"INR",
          name:"Localbasket",
          description:"Order Payment",
          order_id:razorOrder.data.id,

          handler:async function(response) {
            await axios.post(`${API_URL}/api/orders/placeOrder`,
              {
                ...orderData,
                paymentMethod:"UPI",
                paymentStatus:"Completed"
              },{
                headers:{Authorization:`Bearer ${token}`}
              }
            );

            alert("Payment Successful & Order Placed");
            setCart([]);
            
          }
        }
        const razor = new window.Razorpay(options);
        razor.open();
      }
    }
    catch(err){
      const message=err.response?.data.message || "something went wrong while placing your order";
      alert(message);
    }
  }


  return (
    <div>
      <div className="card p-3 " style={{ minHeight: "350px", backgroundColor: "whitesmoke" }}>
        <strong>
          <h5 className="border-bottom">
            <span style={{ color: "rgb(252, 107, 3)" }}>Order</span> Summary
          </h5>
        </strong>
        <strong>
          <h6 className="mb-2">DELIVERY ADDRESS</h6>
        </strong>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="mb-2">{address ? address : "No Address Found"},</small>
            <small>{mobile || ""}</small>
            </div>

            <button
              onClick={()=>navigate('/update_details')}
              style={{
                border: "none",
                background: "none",
                color: "rgb(252, 107, 3)",
                cursor: "pointer",
                fontSize: "0.9rem",
                textDecoration: "none"
              }}>
              Change
            </button>
        </div>

        <div className="payment-method mt-2 border-bottom">
          <strong>
            <h6>PAYMENT METHOD</h6>
          </strong>
          <select
            className="w-100 mt-1"
            value={paymentMethod}
            onChange={(e)=>setPaymentMethod(e.target.value)}
          >
            <option value="COD">Cash On Delivery</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        <div className="mt-2">
  <div className="price d-flex justify-content-between">
    <small>Items Total</small>
    <small>₹{itemsTotal}</small>
  </div>

  <div className="d-flex justify-content-between">
    <small>Delivery Charge</small>
    <small>₹{DELIVERY_CHARGE}</small>
  </div>

  <div className="d-flex justify-content-between mt-1">
    <small><strong>Total</strong></small>
    <small><strong>₹{total}</strong></small>
  </div>
</div>


          <div className="place-order-btn mt-2">
            <button
              className="w-100"
              onClick={handlePlaceOrder}
              style={{
                backgroundColor: "rgb(252, 107, 3)",
                border: "1px solid rgb(252, 107, 3)",
                height: "30px",
                color: "white",
              }}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
  );
}
export default OrderSummary;
