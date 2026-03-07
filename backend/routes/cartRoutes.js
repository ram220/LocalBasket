const express=require('express');
const cartControllers=require('../controllers/cartControllers');
const authMiddlewares=require('../middlewares/authMiddlewares');

const router=express.Router();

router.post('/addToCart',authMiddlewares.protectRoutes,authMiddlewares.isUser,cartControllers.addToCart);
router.get('/getCart',authMiddlewares.protectRoutes,authMiddlewares.isUser,cartControllers.getCart);
router.patch('/updateQuantity/:productId',authMiddlewares.protectRoutes,authMiddlewares.isUser,cartControllers.updateQuantity);
router.patch('/removeFromCart/:productId',authMiddlewares.protectRoutes,authMiddlewares.isUser,cartControllers.removeFromCart);

module.exports=router;