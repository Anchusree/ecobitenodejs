const mongoose = require("mongoose")
const {ObjectId} =  mongoose.Schema.Types


const notificationSchema = new mongoose.Schema({
    title:{
        type:String, 
        required:true
    },

    message:{
        type:String, 
        required:true
    },
    notificationType:Number,  //1- addNewRestaurant, 2- placeorder, 3- new user

    user_id:{
        type:ObjectId, //like a foregn key reference
        ref:"User" //collection name
    }
},{timestamps:true})

const Notification = mongoose.model("Notification",notificationSchema)
module.exports = Notification