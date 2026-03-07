const express=require("express");
const authMiddlewares=require('../middlewares/authMiddlewares');
const orderControllers=require('../controllers/ordersControllers');

const router=express.Router();

router.post('/placeOrder',authMiddlewares.protectRoutes,authMiddlewares.isUser,orderControllers.placeOrder);
router.post('/create-razorpay-order',authMiddlewares.protectRoutes,authMiddlewares.isUser,orderControllers.createRazorPayOrder);
module.exports=router;