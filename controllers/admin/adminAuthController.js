const User = require("../../models/userModel")
const crypto = require("crypto")
const bcrypt = require("bcrypt")
const shortId = require('shortid')
const Restaurant = require("../../models/restaurantModel")
const { createAccessToken } = require("../../middlewares/auth")


exports.loginAdmin = async(req,res)=>{

    const {email,password} = req.body
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
            if(doMatch && savedUser.role === "admin"){

                const token = createAccessToken({id:savedUser.id})

                let update = User.findByIdAndUpdate(savedUser._id,{device_token:token},{new:true})
                //update = JSON.parse(JSON.stringify(update))


                const { _id, name, email, role, mobile, username } = savedUser
                
                return res.status(200).json({
                    message:"Success",
                    token,
                    user:_id, name, email, role, mobile, username
                })
            }
        })
    })
}


exports.adminForgotPassword = async(req,res)=>{
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(422).json({error:"There is no any users associated with this email"})
    }
    const resetToken = crypto.randomBytes(32).toString("hex")
    let passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    let update = await User.findByIdAndUpdate(user._id,{passwordResetToken },{new:true})
    update = JSON.parse(JSON.stringify(update))

    return res.status(200).json({ passwordResetToken, email })
}

exports.adminResetPassword = async(req,res)=>{

    const {passwordResetToken, email, newPassword, confirmPassword}= req.body

    if(!passwordResetToken || !newPassword || !confirmPassword){
        return res.status(422).json({message:"Please enter your new password"})
    }
    if(newPassword === confirmPassword){
       const userDetails = await User.findOne({email:email})
        bcrypt.hash(newPassword, 10)
        .then(hashed => {
            User.findByIdAndUpdate(userDetails._id,{password:hashed, passwordResetToken:"null" },{new:true})
            return res.status(200).json({message:"Password has been changed successfully"})
        })
    }
    else{
        return res.status(422).json({message:"Passwords doesn't match"})
    }
}



exports.adminLogout = async (req,res)=>{
    try {
        const adminId = req.body.id;

        // Update restaurant's device token to null
        const findAdmin = await User.findOneAndUpdate(
            { "_id":adminId,"role":"admin" },
            { $set: { device_token: null } },
            { new: true }
        );

        if (findAdmin) {
            req.user = null;
            return res.status(200).json({
                message: "Success"
            });
        } else {
            return res.status(404).json({
                message: "Admin User not found"
            });
        }
    } catch (error) {
        // Handle any errors that occur during the operation
        console.error("Error during admin logout:", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

exports.getAdminProfile = async(req,res)=>{
   
    let getAdminUser = await User.findById(req.user._id)
    res.status(200).json({
        message:"Success",
        response:getAdminUser
    })
}

exports.adminUpdatePassword = async(req,res)=>{

    const newPassword = req.body.newPassword
    const id = req.body.id
    const hashNewpassword = await bcrypt.hash(newPassword, 10)

    await User.findByIdAndUpdate(id,{password:hashNewpassword},{new:true})
    .then((usr)=>{
        res.status(200).json({
            message:"Success",
            msg:"Updated Password"
        })
    })
}
exports.adminUpdateEmail = async(req,res)=>{
    const email = req.body.email
    const id = req.body.id
   const updateUser = await User.findByIdAndUpdate(id,{email:email},{new:true})
   if(updateUser){
    res.status(200).json({message:"Success",msg:"Updated Email"})
   }
   else{
    res.status(400).json({message:"Somehing went wrong"})
   }

 
}


