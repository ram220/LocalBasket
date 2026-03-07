const Orders=require('../models/ordersModel');
const Cart=require('../models/cartModel');
const calculateOffer=require('../utils/offersCheck');
const razopay=require('../config/razorpay');


exports.placeOrder = async(req,res)=>{
    try{
        const userId=req.user.id;
       // const {items,itemsTotal,deliveryCharge,totalAmount,paymentMethod}=req.body;

       // here 

       const {paymentMethod,paymentStatus}=req.body;
       const cart = await Cart.findOne({ userId }).populate("items.productId");

if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
}

let itemsTotal = 0;

const updatedItems = cart.items.map(item => {
    const offerData = calculateOffer(item.productId);
    const finalPrice = offerData.finalPrice || item.productId.price;

    itemsTotal += finalPrice * item.quantity;

    return {
        productId: item.productId._id,
        quantity: item.quantity,
        price: finalPrice,
        image: item.productId.image,
        vendorId: item.productId.vendorId
    };
});

const deliveryCharge = 0; // or your logic
const totalAmount = itemsTotal + deliveryCharge;

// upto here
        const newOrder=await Orders.create({
            userId,
            //items,
            items:updatedItems,
            itemsTotal,
            deliveryCharge,
            totalAmount,
            paymentMethod:paymentMethod,
            paymentStatus:paymentStatus || "Pending"
        })

        await Cart.findOneAndUpdate({userId},{items:[]});

        res.status(201).json({
            message:"Order placed successfully",
            order: newOrder
        })
    }
    catch(err){
                    console.log("ORDER ERROR:", err); 

        res.status(500).json({
            message:"error while placing order try after some time",
            err:err.message
        })
    }
}


exports.createRazorPayOrder=async(req,res)=>{
    try{
        const {amount}=req.body;

        const options={
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt_" + Date.now()
        }

        const order = await razopay.orders.create(options);

        res.status(201).json(order);
    }
    catch(err){
        res.status(500).json({ message: "Error creating Razorpay order",err:err.message });
    }
}

