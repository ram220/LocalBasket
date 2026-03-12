const express=require('express');
const vendorControllers=require('../controllers/vendorControllers');
const authMiddlewares=require('../middlewares/authMiddlewares');
const upload=vendorControllers.upload;
const checkVendorSubscription=require('../middlewares/checkVendorSubscription');

const router=express.Router();

router.post('/addProduct',authMiddlewares.protectRoutes,authMiddlewares.isVendor,checkVendorSubscription.checkSubscription,upload.single("image"),vendorControllers.addProduct)
router.get('/fetchProducts',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.getVendorProducts);
router.patch('/updateProduct/:productId',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.updateProduct);
router.patch('/deleteProduct/:productId',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.deleteProduct);
router.get('/getOrders',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.getVendorOrders);
router.patch('/update_item_status',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.updateItemStatus);
router.get('/income',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.getVendorMonthlyIncome);
router.get("/shop-status",authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.getShopStatus);
router.patch("/toggle-shop",authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.toggleShopStatus);

module.exports=router;