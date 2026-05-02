const jwt=require('jsonwebtoken');
const Users = require('../models/userModel');
const Vendors = require('../models/vendorModel');
const Admin = require('../models/adminModel');
const DeliveryAgent=require('../models/deliveryAgentModel');

exports.protectRoutes=async(req,res,next)=>{
    try{
        const testToken=req.headers.authorization;
        if(!testToken || !testToken.startsWith("Bearer ")){
            return res.status(401).json({
                status:"fail",
                message:"invalid token or token is expired please login again"
            });
        }

        const token=testToken.split(" ")[1];

        let decodedToken;

        try {
            decodedToken = jwt.verify(token, process.env.MY_LOCALBASKET_SECRET_KEY);
        } catch (err) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid or expired token please login to continue"
            });
        }

        
        
        let user=await Users.findById(decodedToken.id);
    
        if(!user){
            user=await Vendors.findById(decodedToken.id);
        }

        if(!user){
            user=await Admin.findById(decodedToken.id);
        }

        if(!user){
            user=await DeliveryAgent.findById(decodedToken.id);
        }


        if (user.passwordChangedAt) {
            const changedTime = parseInt(user.passwordChangedAt.getTime() / 1000, 10);

            if (decodedToken.iat < changedTime) {
                return res.status(401).json({
                    status: "fail",
                    message: "Password changed recently. Please login again."
                });
            }
        }

        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: "User not found"
            });
        }

        req.user=user;

        next();
    }
    catch(err){
        res.status(500).json({
            status:"fail",
            message:"error in authMiddleware",
            err:err.message
        })
    }
}

exports.optionalAuth = async (req, res, next) => {
    try {
        const testToken = req.headers.authorization;
        if (!testToken || !testToken.startsWith("Bearer ")) {
            req.user = null;
            return next();
        }

        const token = testToken.split(" ")[1];
        if (token === "null" || !token) {
            req.user = null;
            return next();
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.MY_LOCALBASKET_SECRET_KEY);
        } catch (err) {
            req.user = null;
            return next();
        }

        let user = await Users.findById(decodedToken.id);
        if (!user) user = await Vendors.findById(decodedToken.id);
        if (!user) user = await Admin.findById(decodedToken.id);
        if (!user) user = await DeliveryAgent.findById(decodedToken.id);

        req.user = user || null;
        next();
    } catch (err) {
        req.user = null;
        next();
    }
};

exports.isAdmin=(req,res,next)=>{
    if(req.user.role!=="admin"){
        return res.status(403).json({
            status: "fail",
            message: "Access denied. Admin only"
        })
    }
    next();
}

exports.isVendor=(req,res,next)=>{
    if(req.user.role!=="vendor"){
        return res.status(403).json({
            status: "fail",
            message: "Access denied. Vendor only"
        });
    }
    next();
}

exports.isUser = (req, res, next) => {
    if (req.user.role !== "user") {
        return res.status(403).json({
            status: "fail",
            message: "Access denied. User only"
        });
    }
    next();
};

exports.isDeliveryAgent=(req,res,next)=>{
    if(req.user.role!=="delivery_agent"){
        return res.status(403).json({
            status:"fail",
            message:"Access denied. Delivery agent only"
        })
    }
    next();
}