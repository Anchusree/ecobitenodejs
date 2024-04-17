const mongoose = require("mongoose")
const {ObjectId} =  mongoose.Schema.Types


const orderSchema = new mongoose.Schema({
  
    total_amount:{
        type:Number, 
        required:true
    },
    order_date:{
        type:Date,
        required: true
    },
    user_id:{
        type:ObjectId, //like a foregn key reference
        ref:"User" //collection name
    },

    restaurant_id:{
        type:ObjectId, //like a foregn key reference
        ref:"Restaurant" //collection name
    },

    cart_id:{
        type:ObjectId, //like a foregn key reference
        ref:"Cart" //collection name
    },
    order_status:[
        {
            status:{
                type:String,
                enum:["Ordered", "Preparing","Ready","Cancelled","Completed"],
                default:"Ordered"
            },
            date:{
                type:Date,
            },
            isCompleted:{
                type:Boolean,
                default:false
            }
    }],
    paymentType:{
        type:String,
        enum:["cod","card"]
    },
    reservation_code:{
        code:{
            type: String,
            default:"null",
        },
        expiredTime:{
            type:Date
        },
        orderId:{
            type:ObjectId
        }  
    },
    current_status:{
        type: String,
        default:"pending"
    },
},{timestamps:true})

const Order = mongoose.model("Order",orderSchema)
module.exports = Order