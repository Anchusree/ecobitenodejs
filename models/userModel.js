const mongoose = require("mongoose")
//const {ObjectId} =  mongoose.Schema.Types


const userSchema = new mongoose.Schema({
    email:{
        type:String, 
        required:true,
        unique:true,
        lowercase:true
    },
    name:{
        type:String, 
        required:true
    },
    username:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        index:true
    },
    mobile: {
        type: String,
        default : '0'
    },
    
    password:{
        type:String, 
        required:true
    },
    profileImage:{
        type:String, 
        default:"https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg"
    },
    role:{
        type:String, 
        enum:["customer","admin","restaurant"], //for different roles 
        default:"customer"
    },
    isBlocked: {
        type:Number,
        default:0 //0=off or 1=on
      },
    passwordResetToken: {
        type:String,
        default:''  
    },
    notificationStatus:{
      type: Number,
      default: 0 // getNotification - 0-off, 1-on
    },
    device_token:{
        type:String,
        default:'null'
    }
},{timestamps:true})

const User = mongoose.model("User",userSchema)
module.exports = User