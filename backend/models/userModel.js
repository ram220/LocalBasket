const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
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
    isVerified:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        default:"user",
    }
},{timestamps:true});

const Users=mongoose.model("User",userSchema);

module.exports=Users;