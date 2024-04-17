const mongoose = require("mongoose")
const {ObjectId} =  mongoose.Schema.Types


const categorySchema = new mongoose.Schema({
    
    category_name:{
        type: String,
        required:true,
    },
    restaurant_id:{
        type:  ObjectId,
        ref: "Restaurant",
    }
},{timestamps:true})

const Category = mongoose.model("Category",categorySchema)
module.exports = Category
