const mongoose = require("mongoose")
const {ObjectId} =  mongoose.Schema.Types


const rewardSchema = new mongoose.Schema({
    total_points:{
        type:Number, 
        required:true
    },

    user_points:{
        type:Number, 
        required:true
    },

    user:{
        type:ObjectId, //like a foregn key reference
        ref:"User" //collection name
    },

    menu:{
        type:ObjectId, //like a foregn key reference
        ref:"Menu" //collection name
    },
},{timestamps:true})

const Rewards = mongoose.model("Rewards",rewardSchema)
module.exports = Rewards