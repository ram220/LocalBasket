const express=require('express');
const dotenv=require('dotenv');
dotenv.config({path:'./.env'});
const connectDb=require('./config/db');
const cors=require('cors');

const authRoutes=require('./routes/authRoutes');
const adminRoutes=require('./routes/adminRoutes');
const vendorRoutes=require('./routes/vendorRoutes');
const userRoutes=require('./routes/userRoutes');
const cartRoutes=require('./routes/cartRoutes');
const orderRoutes=require('./routes/orderRoutes');
const chatbotRoutes=require('./routes/chatbotRoutes');
const deliveryAgentRoutes=require('./routes/deliveryAgentRoutes');
const vendorPaymentRoutes=require('./routes/vendorPaymentRoutes');

const app=express();

app.use(cors());

connectDb();

app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/vendor',vendorRoutes);
app.use('/api/user',userRoutes);
app.use('/api/cart',cartRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/chatbot',chatbotRoutes);
app.use('/api/agent',deliveryAgentRoutes);
app.use('/api/vendorPayment',vendorPaymentRoutes);


app.get("/",(req,res)=>{
    res.send("hello from the server")
});

const sendEmail = require('./utils/sendEmail');
app.get("/api/test-email", async (req, res) => {
    const to = req.query.email || process.env.EMAIL_USER;
    const result = await sendEmail(to, "Test Email from LocalBasket", "If you receive this, your Render email config is perfect!");
    
    if (result.success) {
        res.json({ message: "Email sent successfully!", ...result, check: "Check your inbox!" });
    } else {
        res.status(500).json({ message: "Email failed to send. Check this exact error:", error: result.error, hint: "Are EMAIL_USER and EMAIL_PASS set correctly in Render?" });
    }
});

const port=process.env.PORT || 7000;
app.listen(port,()=>{
    console.log("server running on port: ",port);
});