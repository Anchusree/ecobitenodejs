const User = require("../../models/userModel")
const bcrypt = require("bcrypt")
const shortId = require('shortid')
const crypto = require('crypto')
const Restaurant = require("../../models/restaurantModel")
const { createAccessToken } = require("../../middlewares/auth")
const Menu = require("../../models/menuModel")
const { sendPushNotification } = require("../../utils/commonFunction")

exports.registerRestaurant = async(req, res) => {

    const { email, restaurantName, phone, address,from,to, password,pic,expotoken  } = req.body

    try {
        if (!email || !restaurantName || !phone || !address || !password || !pic) {
            return res.status(422).json({ message: "Please fill all the fields" })
        }
    
        await Restaurant.findOne({ email: email }) //find if the email exist in database
            .then((savedUser) => {
                if (savedUser) {
                    return res.status(422).json({ message: "This email already exists" })
                }
                else {
                    bcrypt.hash(password, 10)
                        .then(async hashed => {
                            const _user = new User({
                                name:restaurantName,
                                email:email,
                                mobile:phone,
                                password: hashed,
                                username: shortId.generate(),
                                role: "restaurant",
                                profileImage:pic
                            })
                            _user.save()
                            if(_user){
                                const restaurantUser = new Restaurant({
                                    restaurantName,
                                    email,
                                    phone,
                                    address,
                                    username: shortId.generate(),
                                    user_id:_user._id,
                                    open_close_time:{
                                        from:from,
                                        to:to
                                    },
                                    restaurantImage:pic,
                                    restaurantStatus:"Pending"
                                })
                                restaurantUser.save()
    
                                const findAdminUser = await User.find({"role":"admin"})
                                if(restaurantUser){
                                   await sendPushNotification(findAdminUser[0]._id, "New Restaurant Registered", `${restaurantUser.restaurantName} restaurant registered to system`,expotoken);
                                    return res.status(201).json({
                                        message:"Registered Successfully"
                                    })
                                }
                            }
                            else{
                                return res.status(400).json({
                                    message:"Something went wrong"
                                })  
                            }
                           
                           
                        })
                }
            })
    } catch (error) {

        if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
            // Handle duplicate email error
            console.log("Error: Duplicate email found.");
            // Additional handling logic, such as logging, notifying the user, or retrying
        } else {
            // Handle other errors
            console.error("MongoDB error:", error);
            // Additional handling logic, such as logging, notifying the user, or retrying
        }
        
    }
 
 
}

exports.loginRestaurant = async(req, res) => {
    const {email,password,expoToken} = req.body
    if(!email || !password){
        res.status(422).json({message:"Please provide email/password"})
    }
    await User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            return res.status(422).json({message:"Invalid email or password"})
        }
        
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(!doMatch){
                return res.status(422).json({message:"Invalid email or password"})
            }
            if(doMatch && savedUser.role === "restaurant"){
                let findRestaurant = Restaurant.findOne({email:email})
                
                findRestaurant.then(async(findRest)=>{
                    if(findRest.restaurantStatus === "Accepted"){//checking if restaurant is approved
                        if(findRest.isBlocked == 0){
                            const token = createAccessToken({id:savedUser.id})
    
                            await Restaurant.findByIdAndUpdate(savedUser._id,{device_token:token},{new:true})
                          
                            const { email,phone,addresss,username,role } = savedUser
                            const { restaurantName,user_id,open_close_time } = findRest
                            return res.status(200).json({
                                message:"Success",
                                token,
                                expoToken,
                                restaurantName,email,phone,addresss,username,role,user_id,open_close_time,token,id:findRest.id
                            })
                        }
                        else{
                            return res.status(422).json({message:"Your restaurant has been blocked. Contact administrator."})
                        }
                       
                    }
                    else if(findRest.restaurantStatus === "Rejected"){//checking if restaurant is Rejected
                        return res.status(422).json({message:"Your restaurant application has been Rejected."})
                    }
                    else{
                        return res.status(422).json({message:"Your restaurant is not approved yet."})
                    }
                })
                .catch((err)=>console.log(err))
             
               
            }
        })
    })
}

exports.restaurantForgotPassword = async(req,res)=>{
    const {email} = req.body
    const user = await User.findOne({email:email})
    if(!user){
        return res.status(422).json({message:"There is no any users associated with this email"})
    }
    const resetToken = crypto.randomBytes(32).toString("hex")
    let passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    let update = await User.findByIdAndUpdate(user._id,{passwordResetToken },{new:true})

    return res.status(200).json({message:"Success", passwordResetToken, email })
}

exports.restaurantResetPassword = async(req,res)=>{

    const {passwordResetToken, email, newPassword, confirmPassword}= req.body

    if(!passwordResetToken || !newPassword || !confirmPassword){
        return res.status(422).json({message:"Please enter your new password"})
    }
    if(newPassword === confirmPassword){
       const userDetails = await User.findOne({email:email})
       if(!userDetails){
        return res.status(422).json({message:"There is no any users associated with this email"})
       }
       if(userDetails && userDetails.passwordResetToken === passwordResetToken){
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update the user's password and passwordResetToken
        const updatedUser = await User.findOneAndUpdate(
            { _id: userDetails._id },
            {
            password: hashedPassword,
            passwordResetToken: null,
            },
            { new: true }
        )
        if(updatedUser){
            console.log("paswd updated")
        }
        return res.status(200).json({ message: 'Success' });
            
       }
        
    }
    else{
        return res.status(422).json({message:"Passwords doesn't match"})
    }
}


exports.restaurantLogout = async (req,res)=>{
    try {
        const restaurantId = req.body.id;

        // Update restaurant's device token to null
        const updatedRestaurant = await Restaurant.findOneAndUpdate(
            { "_id": restaurantId },
            { $set: { device_token: null } },
            { new: true }
        );

        // If the restaurant is found and updated, set req.user to null
        if (updatedRestaurant) {
            req.user = null;
            return res.status(200).json({
                message: "Success"
            });
        } else {
            // If the restaurant is not found, return a 404 status code
            return res.status(404).json({
                message: "Restaurant not found"
            })
        }
    } catch (error) {
        // Handle any errors that occur during the operation
        console.error("Error during restaurant logout:", error);
        return res.status(500).json({
            message: "Error"
        });
    }
}

exports.getRestaurantProfile = async(req,res)=>{
    let {id} = req.params
    let getRestaurantUser = await Restaurant.findById(id)
    res.status(200).json({
        message:"Success",
        response:getRestaurantUser
    })
}

exports.updateRestHour =async (req,res)=>{
    console.log("updaterest")

    const restId = req.body.restId
    const from = req.body.from
    const to = req.body.to

    const findRest = await Restaurant.find({"_id":restId})
    if(!findRest){
       
        res.status(400).json({
            message:"restaurant not found."
        })
    }
    else{
        const updateRest = await Restaurant.findByIdAndUpdate(
            { "_id": restId },
            {
              $set: {
                "open_close_time.from": from,
                "open_close_time.to": to
              }
            },
            { new: true }
          );

        if(updateRest){
            res.status(200).json({message:'Success'})
        }
        else{
            res.status(400).json({message:'Update failed'})
        }
    }

}

exports.resetPasswordFromProfile =async (req,res)=>{
    const {email, newPassword, confirmPassword}= req.body

    if(!newPassword || !confirmPassword){
        return res.status(422).json({message:"Please enter your new password"})
    }
    if(newPassword === confirmPassword){
       const userDetails = await User.findOne({email:email})
        bcrypt.hash(newPassword, 10)
        .then(hashed => {
            User.findByIdAndUpdate(userDetails._id,{password:hashed },{new:true})
            return res.status(200).json({message:"Success" })
        })
    }
    else{
        return res.status(422).json({message:"Passwords doesn't match"})
    }
}


exports.restUpdateProfile = async (req,res) =>{

    const {userId,phone,address,email} = req.body

    const userUpdate =  await User.findOneAndUpdate(userId,{email},{new:true})
    const restUpdate =  await Restaurant.findOneAndUpdate(userId,{email,phone,address},{new:true})
    if(userUpdate && restUpdate){
        res.status(200).json({
            message: "Success"
        })
    }
    else{
        res.status(200).json({
            message: "User not found"
        })
    }
}
