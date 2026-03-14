const Products = require("../models/productsModel");
const Vendors = require("../models/vendorModel");
const Orders=require('../models/ordersModel');
const Users = require("../models/userModel");
const calculateOffer=require('../utils/offersCheck');

// all products from every vendor
exports.getAllProducts=async(req,res)=>{
    try{
        const products=await Products.find().populate("vendorId","name shopName category status isShopOpen subscriptionStatus");

        const filteredProducts=products.filter(p=>p.vendorId && p.vendorId.status==="approved");
//from this
        const finalProducts = filteredProducts.map(p => ({
            ...p.toObject(),
            isShopOpen: p.vendorId?.isShopOpen,
            shopName: p.vendorId?.shopName,
            subscriptionStatus: p.vendorId?.subscriptionStatus,
            ...calculateOffer(p)
        }));

        res.status(200).json({
            status:"success",
            message:"successfully fetched all the products",
            finalProducts
        })
        
    }
    catch(err){
        res.status(500).json({
            message:"error while fetching products for user",
            err:err.message
        })
    }
}


// get single product by id

exports.getSingleProduct=async(req,res)=>{
    try{
        const {productId}=req.params;

        const product=await Products.findById(productId).populate("vendorId", "shopName isShopOpen subscriptionStatus");

        if(!product){
            return res.status(404).json({
                status:"fail",
                message:"product not found"
            })
        }
        // from this
        const finalProduct = {
            ...product.toObject(),   // 🔥 flatten
            isShopOpen:product.vendorId?.isShopOpen,
            shopName: product.vendorId?.shopName,
            subscriptionStatus: product.vendorId?.subscriptionStatus,
            ...calculateOffer(product)
        };

        //to here

        res.status(200).json({
            status:"success",
            //product,
            product:finalProduct
            
        })

    }
    catch(err){
        res.status(500).json({
        message: "Error fetching product  details",
        err: err.message
    });
    }
}

// get all vendors and shops for user

exports.getAllStores=async(req,res)=>{
    try{
        const vendors=await Vendors.find({status:"approved"});

        res.status(200).json({
            status:"success",
            message:"successfully fetched all the stores for user",
            vendors
        })
    }
    catch(err){
        res.status(500).json({
            message:"error while fetching stores for user",
            err:err.message
        })
    }
}

// get products vendor wise

exports.getProductsByVendor=async(req,res)=>{
    try{
        const {vendorId}=req.params;
        const products=await Products.find({vendorId}).populate("vendorId", "shopName isShopOpen subscriptionStatus");

        const finalProducts=products.map(p=>({
            ...p.toObject(),
            isShopOpen: p.vendorId?.isShopOpen,
            shopName: p.vendorId?.shopName,
            subscriptionStatus: p.vendorId?.subscriptionStatus,
            ...calculateOffer(p)
        }))

        res.status(200).json({
            status:"success",
            message:"successfully products fetched from vendor",
            products:finalProducts
        })
    }
    catch(err){
        res.status(500).json({
            message:"error while fetching product from vendor for user",
            err:err.message
        })
    }
}


//get recomended products

exports.getRecomendedProducts=async(req,res)=>{
    try{
        const {productId}=req.params;
        const currentProduct=await Products.findById(productId);

        if(!currentProduct) return res.status(400).json({status:"fail",message:"product not found"});

        /*const recommendedProducts = await Products.aggregate([
            { $match: {
                category: currentProduct.category,
                _id : { $ne : currentProduct._id},
                inStock: true
            }},
            { $sample : {size : 4}}
        ]);*/

        const recommendedProducts = await Products.find({
            category: currentProduct.category,
            _id: { $ne: currentProduct._id },
            inStock: true
        })
        .populate("vendorId","shopName isShopOpen subscriptionStatus")
        .limit(4);


        const finalProducts = recommendedProducts.map(p=>({
            ...p.toObject(),
            isShopOpen: p.vendorId?.isShopOpen,
            shopName: p.vendorId?.shopName,
            subscriptionStatus: p.vendorId?.subscriptionStatus,
            ...calculateOffer(p)
        }))

        res.status(200).json({recommendedProducts:finalProducts});
    }
    catch(err){
        res.status(500).json({ message: "Server error" });
    }
}


// get searched products

exports.searchedProduct=async(req,res)=>{
    try{
        const query=req.query.q;
        if(!query || query.trim() === ""){
            return res.status(200).json({
                message: "Empty search",
                products: []
            });
        }

        const products=await Products.find({
            $or:[
                { name: { $regex: query,$options: 'i'}},
                {category: {$regex:query,$options:'i'}},
                { keywords: { $elemMatch: { $regex: query, $options: "i" } } }            ]
        }).populate("vendorId", "name shopName status isShopOpen subscriptionStatus");

        const filteredProducts = products.filter(
            prod=>prod.vendorId && prod.vendorId.status === "approved"
        );

        const finalProducts = filteredProducts.map(p => ({
            ...p.toObject(),
            isShopOpen: p.vendorId?.isShopOpen,
            shopName: p.vendorId?.shopName,
            subscriptionStatus: p.vendorId?.subscriptionStatus,
            ...calculateOffer(p)
        }));
        res.status(200).json({
            message: "Search results",
            products: finalProducts
        });
    }
    catch(err){
        res.status(500).json({
            message: "Error while searching products",
            err: err.message
        });
    }
}

// get user orders 
exports.getUserOrders=async(req,res)=>{
    try{
        const userId=req.user.id;
        const orders=await Orders.find({userId})
        .populate("deliveryAgentId", "name mobile")
            .sort({ createdAt: -1 });
        res.status(200).json({
            message:"orders fetched",
            orders
        })
    }
    catch(err){
        res.status(500).json({
            message:"error while fetching your orders",
            err:err.message
        })
    }
}


// get offer section products

exports.getOfferProducts = async(req,res)=>{
    try{
        const today=new Date();

        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);

        const products = await Products.find({
            expiryDate:{
                $gte:today,
                $lte:threeDaysLater
            },
            inStock:true
        }).populate("vendorId", "name shopName status isShopOpen subscriptionStatus");

        const filtered = products.filter(
            prod=>prod.vendorId.status === "approved"
        );

        const offers = filtered.map(p=>({
            ...p.toObject(),
            isShopOpen: p.vendorId?.isShopOpen,
            shopName: p.vendorId?.shopName,
            subscriptionStatus: p.vendorId?.subscriptionStatus,
            ...calculateOffer(p)
        }));

        res.status(200).json({
            message: "Offer products fetched",
            products: offers
        });
    }
    catch(err){
        res.status(500).json({
            message: "Error fetching offers",
            err: err.message
        });
    }
}


// cancel order
exports.cancelOrder = async (req, res) => {
    try {

        const order = await Orders.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Unauthorized action"
            });
        }

        const orderTime = new Date(order.createdAt);
        const currentTime = new Date();
        const diffMinutes = (currentTime - orderTime) / (1000 * 60);

        if (diffMinutes > 10) {
            return res.json({
                message: "Cancel time expired"
            });
        }

        order.orderStatus="Cancelled";

        // cancel ALL items in order
        order.items.forEach(item => {
            item.status = "Cancelled";
        });

        await order.save();

        res.status(200).json({
            message: "Order cancelled successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: "error while canceling your order",
            err: err.message
        });
    }
};

// get user details

exports.getUserDetails=async(req,res)=>{
    try{
        const userId=req.user.id;
        const user=await Users.findById(userId);
        if(!user){
            return res.status(404).json({
                status:"fail",
                message:"user not found or user no more exists"
            })
        }

        res.status(200).json({
            status:"success",
            address:user.address,
            mobile:user.mobile
        })
    }
    catch(err){
        res.status(500).json({
            message:"error while fetching your details",
            err:err.message
        })
    }
}

// to change address

exports.updateDetails=async(req,res)=>{
    try{
        const {address,mobile}=req.body;
        if (!address || !mobile) {
            return res.status(400).json({
                message: "Address and mobile are required"
            });
        }
        const userId=req.user.id;
        const user=await Users.findByIdAndUpdate(userId,{address,mobile},{new:true,runValidators:true});

        res.status(200).json({
            status:"success",
            message:"your details updated successfully"
        })
    }
    catch(err){
        res.status(500).json({
            message:"error while changing your address",
            err:err.message
        })
    }
}