const Notification = require("../../models/notificationModel");
const Restaurant = require("../../models/restaurantModel")
const User = require("../../models/userModel")
const {sendPushNotification } = require("../../utils/commonFunction");

exports.getAllUsers = async(req,res)=>{

    let userList = await User.find({ role: 'customer' })
    return res.status(200).json({message:"Success",userLists:userList})
   
}

exports.getAllRestaurants = async(req,res)=>{

    let acceptedList = await Restaurant.find({restaurantStatus:"Accepted"})
    let rejectedList = await Restaurant.find({restaurantStatus:"Rejected"})
    let pendingList = await Restaurant.find({restaurantStatus:"Pending"})
    return res.status(200).json({message:"Success",acceptedList,rejectedList,pendingList})
   
}


exports.getOneRestaurant = async(req,res)=>{
    
    let id = req.params.id

    let findRestaurant = await Restaurant.findById(id)

    res.status(200).json({
        message:"Success",
        response:findRestaurant
    })
   
}


exports.getAdminDashboard = async(req,res)=>{

    const customerCount = await User.countDocuments({ role: 'customer' });
    const restaurantCount = await Restaurant.countDocuments()
    res.status(200).json({
        message:"Success",
        customerCount,
        restaurantCount

    })
}

exports.manageNotofications = async(req,res)=>{
    try {
      console.log("manage notifi")
        const { title, description, expotoken, adminId, checkedItems } = req.body;
        console.log(title, description, expotoken, adminId, checkedItems)
    
        // Check if admin exists
        const adminUser = await User.findOne({ _id: adminId });
        if (!adminUser) {
          return res.status(400).json({ message: 'Admin user not found' });
        }
    
        // Iterate through checked items
        for (const itemId in checkedItems) {
          if (checkedItems[itemId]) {
            // Check if item exists in User collection
            const user = await User.findById(itemId);
            if (user) {
              await sendPushNotification(user._id, title, description,expotoken);

              const addNotification = new Notification({
                title: title,
                message: description,
                user_id: user._id,
                notificationType: 4
            })
            await addNotification.save()
            }
    
            // Check if item exists in Restaurant collection
            const restaurant = await Restaurant.findById(itemId);
            if (restaurant) {
              await sendPushNotification(restaurant._id, title, description,expotoken);
            }
          }
        }
    
        // Return success message
        return res.status(200).json({ message: 'Messages sent successfully' });
      } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

exports.custDeleteUser =async(req,res)=>{

  const id = req.body.id

  const customerDelete = await User.findByIdAndDelete(id)
  if(customerDelete){
      res.status(200).json({message:"Success",msg:"Customer Deleted"})
  }
  else{
      res.status(400).json({message:"Success",msg:"Something went wrong"})
  }

}