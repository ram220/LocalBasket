const Vendors = require("../models/vendorModel");
const Razorpay=require('../config/razorpay');
const crypto=require("crypto");


exports.createSubscriptionOrder = async (req,res)=>{
    try{
        const vendor = await Vendors.findById(req.user.id);
        
        let amountInRupees = 4000; // default
        if(vendor && vendor.category) {
            const cat = vendor.category.toLowerCase();
            if(cat.includes("restaurant") || cat.includes("food")) {
                amountInRupees = 5000;
            } else if(cat.includes("grocery") || cat.includes("supermarket") || cat.includes("kirana") || cat.includes("snacks")) {
                amountInRupees = 4000;
            } else if(cat.includes("fruit") || cat.includes("juice") || cat.includes("drinks") || cat.includes("ice cream")) {
                amountInRupees = 3000;
            }
        }

        const options = {
            amount: amountInRupees * 100, // Razorpay expects paise
            currency: "INR",
            receipt: "vendor_sub_" + Date.now()
        }

        const order = await Razorpay.orders.create(options);

        res.status(200).json(order);

    }
    catch(err){
        res.status(500).json({
            message:"Error creating subscription order",
            error:err.message
        })
    }
}


exports.createSubscription = async (req,res)=>{
    try{

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if(expectedSignature !== razorpay_signature){
            return res.status(400).json({
                message:"Invalid payment signature"
            });
        }

        const vendorId = req.user.id;

        const vendor = await Vendors.findById(vendorId);

        if(!vendor){
            return res.status(404).json({
                message:"Vendor not found"
            })
        }

        vendor.subscriptionStatus="active";
        vendor.subscriptionStartDate=new Date();
        vendor.subscriptionEndDate=new Date(Date.now() + 30*24*60*60*1000);

        await vendor.save();

        res.json({
            message:"Subscription activated successfully",
            subscriptionEndDate:vendor.subscriptionEndDate
        })

    }
    catch(err){
        res.status(500).json({
            message:"Payment verification failed",
            error:err.message
        })
    }
}

exports.getSubscriptionStatus = async (req,res)=>{
    try{

        const vendor = await Vendors.findById(req.user.id);

        const today = new Date();

        let daysLeft = 0;

        if(vendor.subscriptionStatus==="trial" && vendor.trialEndDate){
            daysLeft = Math.max(0,Math.ceil((vendor.trialEndDate - today)/(1000*60*60*24)));

            if(daysLeft<=0){
                vendor.subscriptionStatus="expired";
                await vendor.save();
                daysLeft=0;
            }
        }

        if(vendor.subscriptionStatus==="active" && vendor.subscriptionEndDate){
            daysLeft = Math.max(0,Math.ceil((vendor.subscriptionEndDate - today)/(1000*60*60*24)))

            if(daysLeft<=0){
                vendor.subscriptionStatus="expired";
                await vendor.save();
                daysLeft=0;
            }
        }

        let amountInRupees = 4000; // default
        if(vendor && vendor.category) {
            const cat = vendor.category.toLowerCase();
            if(cat.includes("restaurant") || cat.includes("food")) {
                amountInRupees = 5000;
            } else if(cat.includes("grocery") || cat.includes("supermarket") || cat.includes("kirana") || cat.includes("snacks")) {
                amountInRupees = 4000;
            } else if(cat.includes("fruit") || cat.includes("juice") || cat.includes("drinks") || cat.includes("ice cream")) {
                amountInRupees = 3000;
            }
        }

        res.json({
            subscriptionStatus:vendor.subscriptionStatus,
            trialEndDate:vendor.trialEndDate,
            subscriptionEndDate:vendor.subscriptionEndDate,
            daysLeft,
            subscriptionAmount: amountInRupees
        })

    }
    catch(err){
        res.status(500).json({
            message:"Error fetching subscription details"
        })
    }
}