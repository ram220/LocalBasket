const express=require('express');
const authMiddleware=require('../middlewares/authMiddlewares');
const chatbotController=require('../controllers/chatbotController');

const router=express.Router();

router.post('/',authMiddleware.protectRoutes,authMiddleware.isUser,chatbotController.chatBot);

module.exports=router;