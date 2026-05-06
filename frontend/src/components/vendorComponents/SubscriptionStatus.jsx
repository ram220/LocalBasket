import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function SubscriptionStatus() {
  const [subscription,setSubscription]=useState(null);

  const token=localStorage.getItem("token");
  useEffect(()=>{

    const fetchSubscription=async()=>{

      try{

        const res=await axios.get(
          `${API_URL}/api/vendorPayment/subscription-status`,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
          }
        );
        setSubscription(res.data);

      }catch(err){
        const message=err.response?.data.message || "something went wrong in subscription status";
        alert(message)
      }
    };

    fetchSubscription();

  },[]);

  const renewPlan = async () => {

  const res = await axios.post(
    `${API_URL}/api/vendorPayment/createSubscriptionOrder`,
    {},
    {headers:{Authorization:`Bearer ${token}`}}
  );

  const order = res.data;

  const options = {
    key: "rzp_live_RMI6AqNDqxjfS8",
    amount: order.amount,
    currency: order.currency,
    order_id: order.id,

    handler: async function (response) {

      await axios.post(
        `${API_URL}/api/vendorPayment/activateSubscription`,
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        },
        {
          headers:{Authorization:`Bearer ${token}`}
        }
      );

      alert("Subscription Activated");
      window.location.reload();
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

  if(!subscription) return <p>Loading subscription...</p>;

  return (
    <div style={{background:"#fff",padding:"15px",borderRadius:"8px",marginBottom:"20px"}}>
      
      <h3>Subscription Status</h3>

      <p>Status : <b>{subscription.subscriptionStatus}</b></p>

      {subscription.subscriptionStatus==="trial" && (
        <p>Trial Ends : <b>{subscription.daysLeft} days</b></p>
      )}

      {subscription.subscriptionStatus==="active" && (
        <p>Subscription Ends : <b>{subscription.daysLeft} days</b></p>
      )}

      {subscription.subscriptionStatus==="expired" && (
        <div>
          <p style={{color:"red"}}>Your subscription expired. Please renew.</p>
          <button onClick={renewPlan} className="btn btn-warning">
            Renew Plan ₹{subscription.subscriptionAmount || 3000}
          </button>
        </div>
      )}

    </div>
  );
}

export default SubscriptionStatus;