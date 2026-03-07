const express=require('express');
const vendorControllers=require('../controllers/vendorControllers');
const authMiddlewares=require('../middlewares/authMiddlewares');
const upload=vendorControllers.upload;

const router=express.Router();

router.post('/addProduct',authMiddlewares.protectRoutes,authMiddlewares.isVendor,upload.single("image"),vendorControllers.addProduct)
router.get('/fetchProducts',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.getVendorProducts);
router.patch('/updateProduct/:productId',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.updateProduct);
router.patch('/deleteProduct/:productId',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.deleteProduct);
router.get('/getOrders',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.getVendorOrders);
router.patch('/update_item_status',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.updateItemStatus);
router.get('/income',authMiddlewares.protectRoutes,authMiddlewares.isVendor,vendorControllers.getVendorMonthlyIncome);


module.exports=router;