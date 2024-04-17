const Notification = require("../../models/notificationModel");
const User = require("../../models/userModel");


exports.getAdminNotifications =async(req,res)=>{
    try {
        const id = req.params.id
        // console.log(id,"id")
        const findAdmin = await User.find({"role":"admin"})

        const findNotification  = await Notification.find({"user_id":findAdmin[0]._id})
        .sort({ createdAt: 1 });
    
        res.status(200).json({message:"Success", notifications: findNotification})
        
    } catch (error) {
        console.log(error.message)
        res.status(400).json({message:"Notifications not found"})
    }
}