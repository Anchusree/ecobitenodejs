const mongoose = require("mongoose")
const {ObjectId} =  mongoose.Schema.Types


const menuSchema = new mongoose.Schema({
    restaurant_id:{
        type:  ObjectId,
        ref: "Restaurant",
    },
    category_id:{
        type:ObjectId, 
        ref:"Category",
    },

    food_name:{
        type: String,
        required:true,
        length:15
    },

    food_description:{
        type:String,
        required:true,
        length:300
    },

    food_image:{
        type:String,
        default:"null"
    },

    stock_quantity:{
        type:Number,
        default: 0 
    },

    isBlocked:{
        type:Number,
        default: 0 //0 = unblock or 1 = block
    },

    original_price:{
        type: Number,
        default: 0
    },

    discount_price:{
        type: Number,
        default: 0
    },

    new_price:{
        type: Number,
        default: 0
    }  
},{timestamps:true})

const Menu = mongoose.model("Menu",menuSchema)
module.exports = Menu
