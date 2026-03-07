const express=require('express');
const adminControllers=require('../controllers/adminControllers');
const authMiddlewares=require('../middlewares/authMiddlewares');
const router=express.Router();

router.get('/getAllVendors',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.getAllVandors);
router.patch('/approveVendor/:vendorId',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.approveVendor);
router.patch('/rejectVendor/:vendorId',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.rejectVendor);
router.delete('/deleteVendor/:vendorId',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.deleteVendor);
router.get('/getAllOrders',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.getAllOrders);
router.patch('/updateOrderStatus', authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.updateOrderStatus);

module.exports=router;