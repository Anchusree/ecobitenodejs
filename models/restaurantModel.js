const mongoose = require("mongoose")
const {ObjectId} =  mongoose.Schema.Types


const restaurantSchema = new mongoose.Schema({
    
    restaurantName:{
        type:String, 
        required:true
    },
    restaurantImage:{
        type:String, 
        default:"null"
    },
    email:{
        type:String, 
        required:true,
        unique:true
    },
    phone:{
        type:String, 
        default:"0"
    },
    address:{
        type:String, 
        required:true
    },
    
    notificationStatus:{
        type:Number,
        default:0    // 0=off or 1=on
    },
    isBlocked:{
        type:Number,
        default:0   // 0 = unblock or 1 = block
    },
    restaurantStatus:{
        type:String,
        enum:['Accepted','Rejected',"Pending"],
        default:"Pending"
    },
    open_close_status: {
        type: String,
        default: "Closed",  //closed on open
    },
    rating:[{
        type:ObjectId, //like a foregn key reference
        ref:"RatingReview" //collection name
    }],
    open_close_time:{
        from: {
            type: String,
            required: true,
          },
          to: {
            type: String,
            required: true,
          }
    },
    total_earnings:{
        type:Number,
        default:0
    },
    total_Ratings:{
        type:Number,
        default:0
    },
    user_id:{
        type:ObjectId, //like a foregn key reference
        ref:"User" //collection name
    },
    device_token:{
        type:String,
        default:'null'
    }
},{timestamps:true})

const Restaurant = mongoose.model("Restaurant",restaurantSchema)
module.exports = Restaurant