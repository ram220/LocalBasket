const Orders=require('../models/ordersModel');
const Cart=require('../models/cartModel');
const calculateOffer=require('../utils/offersCheck');
const razopay=require('../config/razorpay');
const Vendors=require('../models/vendorModel');
const DeliveryAgent=require('../models/deliveryAgentModel');
const sendEmail=require('../utils/sendEmail');
const Admin=require('../models/adminModel');
const autoAssignAgent=require('../utils/orderAssignment');
const Users = require('../models/userModel');

// Geocoding helper using OpenStreetMap Nominatim with a timeout to keep order placement ultra-fast
const geocodeAddress = async (address) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout

        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": "LocalBasket-MERN-App"
            }
        });
        clearTimeout(timeoutId);
        
        const data = await res.json();
        if (data && data.length > 0) {
            return [parseFloat(data[0].lon), parseFloat(data[0].lat)]; // [longitude, latitude]
        }
    } catch (e) {
        console.log("Geocoding bypassed/failed for address:", address, e.message);
    }
    return null;
};

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

    // Filter out items that have deleted products to avoid crashes
    const validCartItems = cart.items.filter(item => item.productId !== null && item.productId !== undefined);

    if (validCartItems.length === 0) {
        // If all items in cart are null, clean up database cart and return error
        await Cart.findOneAndUpdate({ userId }, { items: [] });
        return res.status(400).json({ message: "All products in your cart are no longer available" });
    }

    let itemsTotal = 0;
    const updatedItems = [];

    for(const item of validCartItems){
        const product = item.productId;
        const vendor = await Vendors.findById(product.vendorId);

        if (!vendor) {
            continue; // Skip items from deleted vendors or handle appropriately
        }

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

    if (updatedItems.length === 0) {
        return res.status(400).json({ message: "No valid items to place an order" });
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

        // Retrieve and geocode user & vendor addresses to populate geographic coordinates dynamically
        const user = await Users.findById(userId);
        let userCoords = [80.6480, 16.5062]; // Default (Vijayawada)
        if (user && user.address) {
            const coords = await geocodeAddress(user.address);
            if (coords) userCoords = coords;
        }

        let vendorCoords = [80.6475, 16.5075]; // Default (Vijayawada)
        const firstVendor = await Vendors.findById(updatedItems[0]?.vendorId);
        if (firstVendor && firstVendor.address) {
            const coords = await geocodeAddress(firstVendor.address);
            if (coords) vendorCoords = coords;
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
            deliveryOTP: Math.floor(1000 + Math.random() * 9000).toString(),
            deliveryLocation: {
                type: 'Point',
                coordinates: userCoords
            },
            pickupLocation: {
                type: 'Point',
                coordinates: vendorCoords
            }
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

