const express=require('express');
const userControllers=require('../controllers/userControllers');
const authMiddlewares=require('../middlewares/authMiddlewares');

const router=express.Router();

router.get('/products',userControllers.getAllProducts);
router.get('/product/:productId',userControllers.getSingleProduct);
router.get('/recommended/:productId',userControllers.getRecomendedProducts);
router.get('/stores',userControllers.getAllStores);
router.get('/products/:vendorId',userControllers.getProductsByVendor);
router.get('/searchedProduct',userControllers.searchedProduct);
router.get('/offer_products',userControllers.getOfferProducts);
router.get('/orders',authMiddlewares.protectRoutes,authMiddlewares.isUser,userControllers.getUserOrders);
router.put('/cancelOrder/:orderId',authMiddlewares.protectRoutes,authMiddlewares.isUser,userControllers.cancelOrder);
router.get('/get_user_details',authMiddlewares.protectRoutes,authMiddlewares.isUser,userControllers.getUserDetails);
router.patch('/update_details',authMiddlewares.protectRoutes,authMiddlewares.isUser,userControllers.updateDetails);

module.exports=router;