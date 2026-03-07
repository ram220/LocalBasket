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


app.get("/",(req,res)=>{
    res.send("hello from the server")
});


const port=process.env.PORT || 7000;
app.listen(port,()=>{
    console.log("server running on port: ",port);
});