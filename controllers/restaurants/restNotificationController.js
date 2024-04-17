const Notification = require("../../models/notificationModel");
const Restaurant = require("../../models/restaurantModel");
const User = require("../../models/userModel");

exports.getRestNotifications =async(req,res)=>{

    try {
        const id = req.params.id
        // console.log(id,"id")

        const findRest = await Restaurant.find({ _id: id })
       const restuser = await User.find({ "_id": findRest[0].user_id })

        const findNotification  = await Notification.find({"user_id":restuser[0]._id})
        .sort({ createdAt: 1 });
    
        res.status(200).json({message:"Success", notifications: findNotification})
        
    } catch (error) {
        console.log(error.message)
        res.status(400).json({message:"Notifications not found"})
    }
}