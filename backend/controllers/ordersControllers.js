const Orders=require('../models/ordersModel');
const Cart=require('../models/cartModel');
const calculateOffer=require('../utils/offersCheck');
const razopay=require('../config/razorpay');
const Vendors=require('../models/vendorModel');
const DeliveryAgent=require('../models/deliveryAgentModel');
const sendEmail=require('../utils/sendEmail');
const Admin=require('../models/adminModel');
const autoAssignAgent=require('../utils/orderAssignment');

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

// from here 

    const updatedItems = [];

    for(const item of cart.items){

        const product = item.productId;

        const vendor = await Vendors.findById(product.vendorId);

        if(!vendor.isShopOpen){
            return res.status(403).json({
                message:`${vendor.shopName} shop is currently closed`
            });
        }

        const offerData = calculateOffer(product);
        const finalPrice = offerData.finalPrice || product.price;

        itemsTotal += finalPrice * item.quantity;

        updatedItems.push({
            productId: product._id,
            name: product.name,
            quantity: item.quantity,
            price: finalPrice,
            image: product.image,
            vendorId: product.vendorId,
            status:"Placed"
        });
    }

// to here

    const vendorSubtotals = {};
    for (const item of updatedItems) {
        const vId = item.vendorId.toString();
        if (!vendorSubtotals[vId]) vendorSubtotals[vId] = 0;
        vendorSubtotals[vId] += item.price * item.quantity;
    }

    let vendorProtectionFee = 0;
    Object.values(vendorSubtotals).forEach(sub => {
        if (sub > 0 && sub < 100) {
            vendorProtectionFee += 15;
        }
    });

    const platformFee = 10;
    let deliveryCharge = 15;
    if (itemsTotal >= 200) {
        deliveryCharge = 0;
    } else if (itemsTotal >= 100) {
        deliveryCharge = 15;
    }

    const totalAmount = itemsTotal + deliveryCharge + platformFee + vendorProtectionFee;

    if(itemsTotal<100){
        return res.status(400).json({
            message:"Minimum order amount is ₹100"
        })
    }

        const newOrder=await Orders.create({
            userId,
            items:updatedItems,
            itemsTotal,
            deliveryCharge,
            platformFee,
            vendorProtectionFee,
            totalAmount,
            paymentMethod:paymentMethod,
            paymentStatus:paymentStatus || "Pending",
            deliveryOTP: Math.floor(1000 + Math.random() * 9000).toString()
        })


        // get unique vendor ids and emails
        const vendorIds = [...new Set(updatedItems.map(item => item.vendorId.toString()))];

        const vendors = await Vendors.find({ _id: { $in: vendorIds } });

        for (const vendor of vendors) {
                sendEmail(
                vendor.email,
                "New Order Received - LocalBasket",
                `Hello ${vendor.shopName},\n\nYou have received a new order.\nOrder ID: ${newOrder._id}\nPlease login to your dashboard to view details.`
            );
        }


        // email for admin
        const admins = await Admin.find();

        for (const admin of admins) {
                sendEmail(
                admin.email,
                "New Order Placed",
                `A new order has been placed.\nOrder ID: ${newOrder._id}\nTotal Amount: ₹${totalAmount}`
            );
        }

        await Cart.findOneAndUpdate({userId},{items:[]});

        res.status(201).json({
            message:"Order placed successfully",
            order: newOrder
        })
    }
    catch(err){
        console.log(err);
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

