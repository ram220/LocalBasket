const express=require('express');
const adminControllers=require('../controllers/adminControllers');
const authMiddlewares=require('../middlewares/authMiddlewares');
const router=express.Router();

router.get('/getAllVendors',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.getAllVandors);
router.patch('/approveVendor/:vendorId',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.approveVendor);
router.patch('/rejectVendor/:vendorId',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.rejectVendor);
router.patch("/activateSubscription/:vendorId",authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.activateVendorSubscription)
router.delete('/deleteVendor/:vendorId',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.deleteVendor);
router.get('/getAllOrders',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.getAllOrders);
router.patch('/updateOrderStatus', authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.updateOrderStatus);
router.post("/add_delivery_agent",authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.addDeliveryAgent);
router.get('/getAllAgents',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.getAllAgents);
router.patch('/approveAgent/:agentId',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.approveAgent);
router.delete('/deleteAgent/:agentId',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.deleteAgent);
router.get('/getApprovedAgents',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.getApprovedAgents);
router.post('/assignDeliveryAgent',authMiddlewares.protectRoutes,authMiddlewares.isAdmin,adminControllers.assignDeliveryAgent);
router.get('/getPlatformEarnings', authMiddlewares.protectRoutes, authMiddlewares.isAdmin, adminControllers.getPlatformEarnings);

module.exports=router;