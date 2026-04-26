import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config";

function OrderSummary({ cart,setCart }) {
  const [address,setAddress]=useState("");
  const [mobile,setMobile]=useState("");
  const [loading,setLoading]=useState(false);
  const navigate=useNavigate()

  const [paymentMethod,setPaymentMethod] = useState("COD");

  const DELIVERY_CHARGE = 15;

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
    if(loading) return;
    if(cart.length === 0){
        alert("Cart is empty, add items to cart and try");
        return;
    }

    if(itemsTotal<200){
      alert("Minimum order amount is ₹200");
      return;
    }

        setLoading(true);

    const orderData = {
        items: cart.map(item=>({
            productId:item.productId._id,
            name:item.productId.name,
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
    finally{
      setLoading(false);
    }
  }


  return (
    <div className="container mt-4 mb-5 px-3">
      <div className="card shadow-sm p-4 border-0" style={{ borderRadius: "16px", backgroundColor: "#fff" }}>
        <h5 className="fw-bold mb-4" style={{ color: "rgb(252, 107, 3)" }}>Order Summary</h5>

        {/* Delivery Address */}
        <div className="mb-4 p-3 rounded-3" style={{ background: "rgba(252, 107, 3, 0.05)" }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold mb-0">Delivery Address</h6>
            <button
              className="btn btn-link p-0 text-decoration-none fw-bold"
              onClick={()=>navigate('/update_details')}
              style={{ color: "rgb(252, 107, 3)", fontSize: "0.9rem" }}
            >
              Change
            </button>
          </div>
          <p className="mb-1 text-muted small">{address ? address : "No Address Found"}</p>
          {mobile && <p className="mb-0 text-muted small">📞 {mobile}</p>}
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <h6 className="fw-bold mb-2">Payment Method</h6>
          <select
            className="form-select"
            value={paymentMethod}
            onChange={(e)=>setPaymentMethod(e.target.value)}
            style={{ borderRadius: "8px" }}
          >
            <option value="COD">Cash On Delivery</option>
            <option value="UPI">UPI (Razorpay)</option>
          </select>
        </div>

        {/* Price Breakdown */}
        <div className="border-top pt-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Items Total</span>
            <span className="fw-semibold">₹{itemsTotal}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Delivery Charge</span>
            <span className="fw-semibold">₹{DELIVERY_CHARGE}</span>
          </div>

          <hr className="my-3" />

          <div className="d-flex justify-content-between align-items-end">
            <span className="fw-bold h5 mb-0">Total Amount</span>
            <div className="text-end">
              <span className="fw-bold h5 mb-0" style={{ color: "rgb(252, 107, 3)" }}>₹{total}</span>
            </div>
          </div>
          {itemsTotal < 200 && (
            <p className="text-danger small mt-2 mb-0">Minimum order amount should be ₹200</p>
          )}
        </div>

        {/* Place Order Button */}
        <button
          className="btn btn-lg w-100 mt-4 text-white fw-bold shadow-sm"
          onClick={handlePlaceOrder}
          disabled={loading || itemsTotal < 200}
          style={{
            background: loading ? "#ccc" : "rgb(252, 107, 3)",
            borderRadius: "12px",
            border: "none",
            height: "50px",
            transition: "all 0.3s ease"
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Placing Order...
            </>
          ) : (
            "Place Order"
          )}
        </button>
      </div>
    </div>
  );
}
export default OrderSummary;
