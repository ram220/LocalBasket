const mongoose=require('mongoose');

const vendorSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"username is a required field"],
        trim:true,
        minlength:[3,"username length should be atleast 3 characters"]
    },
    email:{
        type:String,
        required:[true,"email is a required field"],
        unique:true,
        trim:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/]
    },
    password:{
        type:String,
        required:[true,"password is a required field"],
        trim:true,
        minlength:[6,"username length should be atleast 6 characters"]
    },
    shopName:{
        type:String,
        required:[true,"shop name is a required field"],
    },
    shopImage:{
        type:String,
        default:""
    },
    category:{
        type:String,
        required:[true,"category is a required field"],
    },
    status:{
        type:String,
        enum:["pending","approved","rejected"],
        default:"pending"
    },
    subscriptionStatus:{
        type:String,
        enum:["inactive","trial","active","expired"],
        default:"inactive"
    },
    trialStartDate:{
        type:Date
    },

    trialEndDate:{
        type:Date
    },
    subscriptionStartDate:Date,
    subscriptionEndDate:Date,
    subscriptionPaymentId:String,
    address:{
        type:String,
        required:[true,"address is a required field"],
        trim:true
    },
    mobile:{
        type:String,
        required:[true,"address is a required field"],
        match:[/^[0-9]{10}$/],
    },
    isShopOpen:{
        type:Boolean,
        default:true
    },
    role:{
        type:String,
        enum:["vendor","admin"],
        default:"vendor",
    }
},{timestamps:true});

const Vendors=mongoose.model("Vendor",vendorSchema);

module.exports=Vendors;