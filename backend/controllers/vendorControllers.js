const Products=require('../models/productsModel');
const Vendors = require('../models/vendorModel');
const multer = require("multer");
const path = require("path");
const {CloudinaryStorage}=require("multer-storage-cloudinary")
const cloudinary=require("../config/cloudinary");
const Orders = require('../models/ordersModel');
const mongoose=require('mongoose')
const autoAssignAgent=require('../utils/orderAssignment');
// cloudinary storage for image instead of mutler

const storage=new CloudinaryStorage({
  cloudinary,
  params:{
    folder:"products",
    allowed_formats:["jpg", "png", "jpeg"],
    transformation: [
      { width: 600, height: 600, crop: "limit", quality: "auto" }
    ]
  },
})

const upload=multer({storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },
});

exports.addProduct=async(req,res)=>{
    try{
        const {name,price,category,description,expiryDate,keywords}=req.body;
        
        const vendorId=req.user.id;
        const vendor=await Vendors.findById(vendorId);

        if(vendor.status!=="approved"){
            return res.status(403).json({
                status:"fail",
                message:"your are not approved by the admin to perform this"
            })
        }

        if(vendor.subscriptionStatus!=="active" && vendor.subscriptionStatus!=="trial"){
            return res.status(403).json({
                status:"fail",
                message:"Your Subscription expired. Please renew it."
            })
        }

        let imageUrl = "";
        if(req.file){
            imageUrl=req.file.path;
        }

        const product=await Products.create({name,price,category,image:imageUrl,description,expiryDate,keywords,vendorId});

        res.status(201).json({
            status:"success",
            message:"product added successfully",
            product
        })
    }
    catch(err){
        res.status(500).json({
            message:err.message,
            err:err.message
        })
    }
}


// get all vendor products

exports.getVendorProducts=async(req,res)=>{
    try{
        const page= parseInt(req.query.page) || 1;
        const limit = 5;

        const skip = (page - 1) * limit;
        const vendorId=req.user.id;

        const totalProducts = await Products.countDocuments({vendorId})

        const products=await Products.find({vendorId})
            .skip(skip)
            .limit(limit)
            .sort({createdAt:-1});

        res.status(200).json({
            status:"success",
            message:"successfully fetched all the products",
            products,
            totalPages: Math.ceil(totalProducts/limit),
            currentPage:page
        })
    }
    catch(err){
        res.status(500).json({
            message:"error while fetching products",
            err:err.message
        })
    }
}


// update products

exports.updateProduct=async(req,res)=>{
    try{
        const {productId}=req.params;
        const vendorId=req.user.id;

        const product=await Products.findOne({
            _id:productId,vendorId:vendorId
        });

    if(!product){
        return res.status(404).json({
            status: "fail",
            message: "Product not found or not authorized"
        });
    }

    const updatedProduct=await Products.findByIdAndUpdate(
        productId,
        req.body,
        {new:true}
    );

    res.status(200).json({
        status: "success",
        message: "Product updated successfully",
        updatedProduct
    });

    }
    catch(err){
        res.status(500).json({
            message:"error while updating product",
            err:err.message
        })
    }
}


// delete product

exports.deleteProduct=async(req,res)=>{
    try{
        const {productId}=req.params;
        console.log(productId)
        const vendorId=req.user.id;

        const deletedProduct=await Products.findByIdAndDelete(productId);

        if(!deletedProduct){
            return res.status(404).json({
                status:"fail",
                message:"product not found or not authorized"
            });
        }

        res.status(200).json({
            status:"success",
            message:"product deleted"
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message:"error while deleting product",
            err:err.message
        })
    }
}


// get vendor orders
exports.getVendorOrders = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const page=parseInt(req.query.page) || 1;
        const limit = 2;
        const skip = (page - 1) * limit;
        
        const totalOrders = await Orders.countDocuments({
            "items.vendorId":vendorId
        })

        const orders = await Orders.find({"items.vendorId": vendorId})
            .skip(skip)
            .limit(limit)
            .sort({createdAt:-1})
            .populate("items.productId", "name price image")
            .populate("userId", "name email address mobile");
 


        // Filter only vendor items
        const filteredOrders = orders.map(order => {
            const vendorItems = order.items.filter(
                item => item.vendorId.toString() === vendorId
            );

            const vendorTotal=vendorItems.reduce((total,item)=>{
                return total + (item.price * item.quantity);
            },0);

            return {
                _id: order._id,
                userId: order.userId,
                items: vendorItems,
                totalAmount: vendorTotal,
                orderStatus: order.orderStatus,
                paymentStatus:order.paymentStatus,
                paymentMethod:order.paymentMethod,
                createdAt: order.createdAt,
            
            };
        });

        res.status(200).json({
            message:"vendor orders fetched",
            orders: filteredOrders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit)
        });

    } catch (err) {
        res.status(500).json({
            message: "Error fetching vendor orders",
            error: err.message
        });
    }
};

// get vendor income

// GET VENDOR MONTHLY INCOME
// controllers/vendorControllers.js

exports.getVendorMonthlyIncome = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const income = await Orders.aggregate([
      // break items array
      { $unwind: "$items" },

      // only this vendor items
      {
        $match: {
          "items.vendorId": new mongoose.Types.ObjectId(vendorId)
        }
      },

      // group by month + year
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalIncome: {
            $sum: {
              $multiply: ["$items.price", "$items.quantity"]
            }
          }
        }
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // total income
    const totalIncome = income.reduce(
      (sum, item) => sum + item.totalIncome,
      0
    );

    res.json({
      monthlyIncome: income,
      totalIncome
    });

  } catch (err) {

    res.status(500).json({
      message: "Error fetching vendor income",
      error: err.message
    });
  }
};


// to update item order status

exports.updateItemStatus=async(req,res)=>{
    try{
        const {orderId,itemId,status}=req.body;
        const vendorId=req.user.id;

        const order=await Orders.findById(orderId);

        if(!order){
             return res.status(404).json({
                message: "Order not found"
            });
        }

        const item=order.items.id(itemId);

        if(!item){
            return res.status(404).json({
                message: "Item not found"
            });
        }

        if(item.vendorId.toString() !== vendorId){
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        item.status=status;

        await order.save();

        const allCancelled = order.items.every(i => i.status === "Cancelled");

            if (allCancelled) {
                order.orderStatus = "Cancelled";
                await order.save();
                return res.status(200).json({
                    message: "Order fully cancelled",
                    order
                });
            }


        //  Assign agent when any item becomes ready

        const anyReady = order.items.some(i => i.status === "Ready");

        // check if already assigned (avoid duplicate assignment)
        if (anyReady && !order.deliveryAgentId) {
            autoAssignAgent(order._id)
                .then(() => console.log("Agent assigned"))
                .catch(err => console.log("Auto assign error:", err));
        }

        res.status(200).json({
            message: "Item status updated",
            order
        });
    }
    catch(err){
        res.status(500).json({
            
            message: "Error updating status",
            error: err.message
        });
    }
}


// get shop status

exports.getShopStatus = async (req,res)=>{
  try{

    const vendor = await Vendors.findById(req.user.id);

    if(!vendor){
      return res.status(404).json({
        message:"Vendor not found"
      })
    }

    res.status(200).json({
      isShopOpen: vendor.isShopOpen
    });

  }catch(err){
    res.status(500).json({
      message:"Error fetching shop status",
      error:err.message
    })
  }
}

// toggle vendor shop open / close

exports.toggleShopStatus = async (req,res)=>{
  try{

    const vendorId = req.user.id;

    const vendor = await Vendors.findById(vendorId);

    if(!vendor){
      return res.status(404).json({
        message:"Vendor not found"
      });
    }

    vendor.isShopOpen = !vendor.isShopOpen;

    await vendor.save();

    res.status(200).json({
      message:"Shop status updated",
      isShopOpen:vendor.isShopOpen
    });

  }catch(err){
    res.status(500).json({
      message:"Error updating shop status",
      error:err.message
    })
  }
}


exports.upload=upload;