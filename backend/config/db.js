const mongoose=require('mongoose')

const connectDb=async()=>{
    try{
        const connect=await mongoose.connect(process.env.MONGO_URI);
        console.log("databse connected");
    }
    catch(err){
        console.log("error while connecting to database: ",err);
    }
}

module.exports=connectDb;