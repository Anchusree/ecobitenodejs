const mongoose = require("mongoose")
const {ObjectId} =  mongoose.Schema.Types


const paymentSchema = new mongoose.Schema({

    paymemnt_status:{
        type:String, 
        enum:["Pending","Completed"],
        // required:true
    },
    paymentType:{
        type:String,
        enum:["cod","card"]
    },
    payment_date:{
        type:Date,
        required: true
    },
    
    payment_amount:{
        type:Number, 
        required:true
    },

    user_id:{
        type:ObjectId, //like a foregn key reference
        ref:"User" //collection name
    },
    cardNumber:{
        type:String,
        required:true,
        default:"0"
    },
    expiredBy:{
        type:String,
        required:true,
        default:"0"
    },
    cvv:{
        type:Number,
        required:true,
        default:0
    },
    order_id:{
        type:ObjectId, //like a foregn key reference
        ref:"Order" //collection name
    },



},{timestamps:true})

const Payment = mongoose.model("Payment",paymentSchema)
module.exports = Payment