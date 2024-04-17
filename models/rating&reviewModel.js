const mongoose = require("mongoose")
const {ObjectId} =  mongoose.Schema.Types


const ratingReviewSchema = new mongoose.Schema({
    rating:{
        type:Number, 
        required:true
    },

    review:{
        type:String, 
        required:true
    },

    user_id:{
        type:ObjectId, //like a foregn key reference
        ref:"User" //collection name
    },

    // restaurant_id:{
    //     type:ObjectId, //like a foregn key reference
    //     ref:"Restaurant" //collection name
    // }
},{timestamps:true})

const RatingReview = mongoose.model("RatingReview",ratingReviewSchema)
module.exports = RatingReview