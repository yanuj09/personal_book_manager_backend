const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DATA_BASE_STRING)
        console.log("MongoDB connected successfully");
    }
    catch(err){
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit the process with failure
    }
}

module.exports = connectDB;