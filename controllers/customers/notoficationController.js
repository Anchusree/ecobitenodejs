const Notification = require("../../models/notificationModel")


exports.getCustNotifications =async(req,res)=>{

    try {
        const id = req.params.id
        // console.log(id,"id")

        const findNotification  = await Notification.find({"user_id":id})
        .sort({ createdAt: 1 });
    
        res.status(200).json({message:"Success", notifications: findNotification})
        
    } catch (error) {
        console.log(error.message)
        res.status(400).json({message:"Notifications not found"})
    }
}