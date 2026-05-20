const mongoose=require('mongoose');

const deliveryAgentSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is a required field"],
        trim:true,
        minlength:[3,"name length should be atleast 3 characters"]
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
        trim:true,
        minlength:[6,"username length should be atleast 6 characters"]
    },
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

    aadhaarImage: {
        type: String,
        required: true
    },
    selfieImage: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status:{
        type:String,
        enum:["pending","approved","blocked"],
        default:"pending"
    },
    isAvailable:{
        type:Boolean,
        default:true
    },

    currentOrder:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        default:null
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    passwordChangedAt:Date,
    activeOrders: {
        type: Number,
        default: 0
    },
    maxOrdersLimit: {
        type: Number,
        default: 2
    },
    isBusy: {
        type: Boolean,
        default: false
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [80.6480, 16.5062] // Default coordinates (e.g. Vijayawada region as placeholder if not updated yet)
        }
    },
    role:{
        type:String,
        default:"delivery_agent"
    }
},{timestamps:true});

deliveryAgentSchema.index({ currentLocation: '2dsphere' });

const DeliveryAgent=mongoose.model('DeliveryAgent',deliveryAgentSchema);

module.exports=DeliveryAgent;