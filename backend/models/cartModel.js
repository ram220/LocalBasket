const mongoose=require('mongoose');

const cartSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    items:[

        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },
            vendorId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Vendor"
            },
            quantity:{
                type:Number,
                default:1,
            },
            price:Number,
        }
    ]
},{timestamps:true});

const Cart=mongoose.model("Cart",cartSchema);

module.exports=Cart;