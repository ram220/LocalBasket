const express=require('express');
const authControllers=require('../controllers/authControllers');

const router=express.Router();

router.post("/register-user",authControllers.registerUser);
router.post("/login-user",authControllers.loginUser);
router.post("/register-vendor",authControllers.registerVendor);
router.post("/login-vendor",authControllers.loginVendor);
router.post("/register-admin",authControllers.registerAdmin);
router.post("/login-admin",authControllers.loginAdmin);

module.exports=router;