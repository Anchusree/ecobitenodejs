const Notification = require("../../models/notificationModel")


exports.getCustNotifications =async(req,res)=>{
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
        const id = req.params.id
        // console.log(id,"id")

        const findNotification  = await Notification.find({"user_id":id, createdAt: { $gte: today }})
        .sort({ createdAt: 1 });
    
        res.status(200).json({message:"Success", notifications: findNotification})
        
    } catch (error) {
        console.log(error.message)
        res.status(400).json({message:"Notifications not found"})
    }
}