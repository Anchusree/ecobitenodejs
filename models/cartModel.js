const mongoose = require("mongoose")
const {ObjectId} =  mongoose.Schema.Types

const cartSchema = new mongoose.Schema({
    total_cart_count:{
        type:Number,
        default:0
    },
    user_id:{
        type:ObjectId, //like a foregn key reference
        ref:"User" //collection name
    },
    cartItems:[
       { 
            menu:{
                type:ObjectId, //like a foregn key reference
                ref:"Menu" //collection name
            },
            quantity:{
                type:Number, 
                default:1
            },
            price:{
                type:Number, 
                default:0 
            },
            subtotal:{
                type:Number,
                default:0
            },
            status:{
                type: String,
                default:"pending"
            },
            restaurantId:{
                type:ObjectId, //like a foregn key reference
                ref:"Restaurant" //collection name
            }

        }
    ]  
},{timestamps:true})

const Cart = mongoose.model("Cart",cartSchema)
module.exports = Cart