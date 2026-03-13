const express=require("express");
const router=express.Router();

const authMiddleware=require("../middlewares/authMiddlewares");
const vendorPaymentController=require("../controllers/vendorPaymentControllers")

router.get("/subscription-status",authMiddleware.protectRoutes,authMiddleware.isVendor,vendorPaymentController.getSubscriptionStatus);
router.post('/createSubscriptionOrder',authMiddleware.protectRoutes,authMiddleware.isVendor,vendorPaymentController.createSubscriptionOrder);
router.post("/activateSubscription",authMiddleware.protectRoutes,authMiddleware.isVendor,vendorPaymentController.createSubscription);

module.exports=router;