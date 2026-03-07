const mongoose=require('mongoose');

const adminSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is a required field"],
        trim:true,
        minlength:[3,"username leangth should be atleast 3 characters"]
    },
    email:{
        type:String,
        required:[true,"email is a required field"],
        unique:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/],
        trim:true
    },
    password:{
        type:String,
        required:[true,"password is a required field"],
        minlength:[3,"username leangth should be atleast 3 characters"],
        trim:true
    },
    role:{
        type:String,
        default:"admin"
    }
},{timestamps:true});

const Admin=mongoose.model("Admin",adminSchema);

module.exports=Admin;