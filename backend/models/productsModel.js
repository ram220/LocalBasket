const mongoose=require('mongoose');

const productsSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is a required field"],
        trim:true,
    },
    price:{
        type:Number,
        required:[true,"price is a required field"],
    },
    category:{
        type:String,
        required:[true,"category is a required field"],
    },
    image:String,
    keywords: {
        type: [String],
        default: []
    },
    description:{type:String,default:"No description yet"},
    inStock: { type: Boolean, default: true },
    expiryDate: {
        type: Date,
        default:null
    },
    vendorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Vendor"
    },

},{timestamps:true});

const Products=mongoose.model("Product",productsSchema);

module.exports=Products;