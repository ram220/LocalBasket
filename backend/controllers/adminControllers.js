const Vendors = require("../models/vendorModel");
const Orders=require('../models/ordersModel');


exports.getAllVandors=async(req,res)=>{
    try{
        const vendors=await Vendors.find();
        res.status(200).json({
            status:"success",
            message:"successfully fetched all the vendors",
            vendors
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