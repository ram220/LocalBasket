const Vendors = require("../models/vendorModel");
const Orders=require('../models/ordersModel');
const DeliveryAgent = require("../models/deliveryAgentModel");
const bcrypt=require('bcrypt');

exports.getAllVandors=async(req,res)=>{
    try{
        const vendors=await Vendors.find();

        const today=new Date();

        const vendorWithSubscription = vendors.map(v=>{
            let daysLeft=0;
            if(v.subscriptionStatus==="trial" && v.trialEndDate){
                daysLeft=Math.max(0,Math.ceil((v.trialEndDate-today)/(1000*60*60*24)));
            }

            if(v.subscriptionStatus==="active" && v.subscriptionEndDate){
                daysLeft=Math.max(0,Math.ceil((v.subscriptionEndDate-today)/(1000*60*60*24)));
            }

            return {
                ...v.toObject(),
                daysLeft
            }
        });

        res.status(200).json({
            status:"success",
            message:"successfully fetched all the vendors",
            vendors:vendorWithSubscription
        })
        
    }
    catch(err){
        res.status(500).json({
            status:"fail",
            message:"error while fetching vendors",
            err:err.message
        })
    }
}


exports.approveVendor=async(req,res)=>{
    try{
        const {vendorId}=req.params;
        const vendor=await Vendors.findByIdAndUpdate(vendorId,{status:"approved"},{new:true});
        if(!vendor){
            return res.status(404).json({
                status: "fail",
                message: "Vendor not found"
            });
        }

        vendor.subscriptionStatus="trial";

        vendor.trialStartDate=new Date();

        vendor.trialEndDate=new Date(Date.now() + 0*24*60*60*1000);

        await vendor.save();

        res.status(200).json({
            status: "success",
            message: "Vendor approved",
            vendor
        });

    }
    catch(err){
        res.status(500).json({
            status:"fail",
            message:"error while approving vendor",
            err:err.message
        })
    }
}

// activate vendor for next 30 days

exports.activateVendorSubscription = async(req,res)=>{
  try{

    const {vendorId} = req.params;

    const vendor = await Vendors.findById(vendorId);

    vendor.subscriptionStatus="active";
    vendor.subscriptionStartDate=new Date();
    vendor.subscriptionEndDate=new Date(Date.now() + 30*24*60*60*1000);

    await vendor.save();

    res.json({
        message:"Vendor subscription activated"
    })

  }catch(err){
    res.status(500).json({message:"Error activating subscription"})
  }
}

exports.rejectVendor=async(req,res)=>{
    try{
        const {vendorId}=req.params;
        const vendor=await Vendors.findByIdAndUpdate(vendorId,{status:"reject"},{new:true});
        if(!vendor){
            return res.status(404).json({
                status: "fail",
                message: "Vendor not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Vendor rejected",
            vendor
        });

    }
    catch(err){
        res.status(500).json({
            status:"fail",
            message:"error while rejecting vendor",
            err:err.message
        })
    }
}



exports.deleteVendor=async(req,res)=>{
    try{
        const {vendorId}=req.params;
        const vendor=await Vendors.findByIdAndDelete(vendorId);
        if(!vendor){
            return res.status(404).json({
                status: "fail",
                message: "Vendor not found"
            });
        }

        res.status(204).json({
            status: "success",
            message: "Vendor deleted",
            vendor
        });

    }
    catch(err){
        res.status(500).json({
            status:"fail",
            message:"error while deleting vendor",
            err:err.message
        })
    }
}

// get all orders

exports.getAllOrders = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalOrders = await Orders.countDocuments();

    const orders = await Orders.find()
      .populate("userId", "name email mobile address")
      .populate("deliveryAgentId", "name mobile")
      .populate({
        path: "items.productId",
        select: "name image price vendorId",
        populate: {
          path: "vendorId",
          select: "shopName email"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit)
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching admin orders" });
  }
};

// to update order status for user

exports.updateOrderStatus = async(req,res)=>{
    try{

        const {orderId,status}=req.body;

        const order=await Orders.findById(orderId);

        if(!order){
            return res.status(404).json({message:"Order not found"});
        }

        order.orderStatus=status;

        await order.save();

        res.json({message:"Order status updated"});

    }
    catch(err){
        res.status(500).json({message:"Error updating order status"});
    }
}


// add delivery agent

exports.addDeliveryAgent=async(req,res)=>{
    try{
        const {name,email,address,mobile}=req.body;

        const existing=await DeliveryAgent.findOne({email});

        if(existing){
            return res.status(409).json({
                message:"Agent already exists"
            })
        }

        const generatePassword=Math.random().toString(36).slice(-8);

        const hashedPassword=await bcrypt.hash(generatePassword,10);

        const agent=await DeliveryAgent.create({
            name,
            email,
            password:hashedPassword,
            address,
            mobile
        })

        res.status(201).json({
            message:"Delivery agent created",
            agent,
            generatePassword,
        })
    }
    catch(err){
        if(err.name==="ValidationError"){
            const errors=Object.values(err.errors).map(e=>e.message);

            return res.status(400).json({
                message:errors[0]
            })
        }

        res.status(500).json({
            message:"Error while creating delivery agent"
        })
    }
}


// get all deliveryagents

exports.getAllAgents=async(req,res)=>{
    try{
        const agents=await DeliveryAgent.find().sort({createdAt:-1});

        res.status(200).json({
            status:"success",
            message:"fetched all the agents",
            agents
        })
    }
    catch(err){
        res.status(500).json({
            message:"Error while fetching agents",
            err:err.message
        })
    }
}


// aprove delivery agents

exports.approveAgent=async(req,res)=>{
    try{
        const {agentId}=req.params;

        const agent=await DeliveryAgent.findByIdAndUpdate(
            agentId,
            {status:"approved"},
            {new:true}
        );

        if(!agent){
            return res.status(404).json({
                message:"Agent not found"
            })
        }

        res.status(200).json({
            status:"success",
            message:"Agent approved"
        })
    }
    catch(err){
        res.status(500).json({
            message:"Error while approving agents",
            err:err.message
        })
    }
}


// delete agent

exports.deleteAgent=async(req,res)=>{
    try{
        const {agentId}=req.params;

        const agent=await DeliveryAgent.findByIdAndDelete(agentId);

        if(!agent){
            return res.status(404).json({
                message:"Agent not found"
            })
        }

        res.status(200).json({
            status:"success",
            message:"Agent deleted"
        })
    }
    catch(err){
        res.status(500).json({
            message:"Error while approving agents",
            err:err.message
        })
    }
}


// get approved agents

exports.getApprovedAgents=async(req,res)=>{
    try{
        const agents=await DeliveryAgent.find({
            status:"approved",
            isAvailable:true
        }).select("name email");

        res.status(200).json({
            agents
        });
    }
    catch(err){
        res.status(500).json({
            message:"Error while fetching approved agents",
            err:err.message
        });
    }
}


// assign delivery agent

exports.assignDeliveryAgent=async(req,res)=>{
    try{
        const {orderId,agentId}=req.body;

        const order=await Orders.findById(orderId);

        order.deliveryAgentId=agentId;
        order.deliveryStatus="Assigned";

        await order.save();

        res.status(200).json({
            status:"success",
            message:"Delivery agent assigned"
        })
    }
    catch(err){
        res.status(500).json({
            message:"Error while assigning delivery agent",
            err:err.message
        })
    }
}