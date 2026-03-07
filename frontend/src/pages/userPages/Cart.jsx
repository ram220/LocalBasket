import { useEffect } from "react";
import axios from 'axios'

import './Cart.css'
import OrderSummary from "./OrderSummary";
function Cart({cart,setCart,fetchCart}) {    


    const token=localStorage.getItem("token");
    const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com"

    //const API_URL = "http://localhost:8000";
    useEffect(()=>{
        if(!token) return;
        fetchCart();
    },[]);


    // set quantity

    const setQuantity=async(productId,quantity)=>{
        if(quantity < 1) return;
    
        try{
            const res=await axios.patch(`${API_URL}/api/cart/updateQuantity/${productId}`,{quantity},{
                headers:{Authorization:`Bearer ${token}`}
            });
            setCart(res.data.cart.items);
        }
        catch(err){
            const message=err.response?.data.message;
            alert(message);
        }
    }

    // remove item form cart

    const removeFromCart=async(productId)=>{
        try{
            const res=await axios.patch(`${API_URL}/api/cart/removeFromCart/${productId}`,{},{
                headers:{Authorization:`Bearer ${token}`}
            });

            setCart(res.data.cart.items);
        }
        catch(err){
            const message=err.response?.data.messagen || "something went wrong while removing item";
            alert(message);
        }
    }


    return (
        <div className="container mt-5 p-3">
            <strong>
                <h4>
                    <span style={{ color: "rgb(252, 107, 3)" }}>Shopping</span> Cart
                </h4>
            </strong>

            <div className="row">
                {/* LEFT SIDE (Cart Items) */}
                <div className="cart-container col-md-8">
                    <div className="cart-header mt-3">
                        <div className="product-col"><h5>Product</h5></div>
                        <div className="subtotal-col"><h5>SubTotal</h5></div>
                        <div className="action-col"><h5>Action</h5></div>
                    </div>

                    {
                        cart.length === 0 ? (<p className="mt -3">Your Cart Is Empty</p>
                        ) : (
                            cart.map((item)=>{
                                if(!item.productId) return null;

                                return (
                                    <div key={item._id} className="cart-row">
                                        {/* product info */}
                                        <div className="cart-product-info">
                                            <img src={item.productId?.image} alt={item.productId?.name}/>
                                            <div>
                                                <h6 className="mb-1">{item.productId.name}</h6>
                                                {/*<small className="mb-1">{item.productId.price}</small>*/}
                                                <small>
                                                    ₹{item.finalPrice}
                                                    {item.isOffer && (
                                                        <span style={{ textDecoration: "line-through", marginLeft: "5px", color: "gray" }}>
                                                        ₹{item.productId.price}
                                                        </span>
                                                    )}
                                                </small>
                                                <input type="number" value={item.quantity} onChange={(e)=>setQuantity(item.productId._id, Number(e.target.value))}/>
                                            </div>
                                        </div>

                                        {/* sub-total */}
                                        <div className="cart-subtotal">
                                            {/*₹{item.productId.price * item.quantity} */}
                                            ₹{item.finalPrice * item.quantity}
                                        </div>

                                        {/* remove from cart mark */}
                                        <div className="cart-action">
                                            <button className="cart-remove-btn" onClick={()=>removeFromCart(item.productId._id)}>❌</button>
                                        </div>
                                    </div>
                                );
                            })
                        )

                    }

                   
                </div>

                {/* RIGHT SIDE (Payment Section) */}
                <div className="col-md-4">
                    <OrderSummary cart={cart} setCart={setCart}/>
                </div>
                
            </div> 
        </div>
    );
}

export default Cart;
