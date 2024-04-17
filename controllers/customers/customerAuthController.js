const User = require("../../models/userModel")
const Notification = require("../../models/notificationModel")
const bcrypt = require("bcrypt")
const shortId = require('shortid')
const crypto = require("crypto")
const { createAccessToken } = require("../../middlewares/auth")
const { sendPushNotification } = require("../../utils/commonFunction")

exports.registerCustomer = async (req, res) => {

    const { email, name, mobile, password,expotoken } = req.body

    if (!email || !name || !mobile || !password) {
        return res.status(422).json({ message: "Please fill all the fields" })
    }
    const findAdminUser =  await User.find({"role":"admin"})

    await User.findOne({ email: email }) //find if the email exist in database
        .then((savedUser) => {
            // console.log(savedUser,"savedUser")
            if (savedUser) {
                return res.status(422).json({ message: "This email already exists" })
            }
            if(!savedUser) {
                console.log("new user")
                bcrypt.hash(password, 10)
                    .then(hashed => {
                        const _user = new User({
                            name,
                            email,
                            mobile,
                            password: hashed,
                            username: shortId.generate(),
                            role: "customer"
                        })
                        _user.save()
                      
                        if (_user) {
                            sendPushNotification(findAdminUser[0]._id, "New User Registered", `${_user.name} has been registered`,expotoken);

                            const addnotify = new Notification({
                                title: "New User Registered",
                                message:`${_user.name} has been registered`,
                                notificationType:3,
                                user_id:findAdminUser[0]._id
                            })
                            addnotify.save()
                           
                           
                            return res.status(201).json({
                                message:"Success",
                                msg: "Registered Successfully"
                            })
                        }

                    })
            }
        })
}

exports.loginCustomer = async(req,res)=>{
    const { email, password, expoToken } = req.body;
    if (!email || !password) {
        return res.status(422).json({ message: "Please provide email/password" });
    }
    try {
        const user = await User.findOne({ email: email });
        
        if (!user) {
            return res.status(422).json({ message: "Invalid email or password" });
        }
        const doMatch = await bcrypt.compare(password, user.password);
        if (doMatch) {
            if (user.role === "customer" || user.role === "admin") {
                const token = createAccessToken({ id: user.id });
                // Update device_token in the user document
                await User.findByIdAndUpdate(user._id, { device_token: token }, { new: true });
                const { _id, name, email, role, mobile, username, profileImage, createdAt } = user;

                return res.status(200).json({
                    message: "Success",
                    token,
                    role:role,
                    expoToken:expoToken,
                    user: { _id, name, email, role, mobile, username,profileImage,createdAt }
                });
            } else {
                return res.status(403).json({ message: "Unauthorized role" });
            }
        } else {
            return res.status(422).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.customerForgotPassword = async (req, res) => {
    console.log( req.body.email)
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(422).json({ message: "There is no any users associated with this email" })
    }
    const resetToken = crypto.randomBytes(32).toString("hex")
    let passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    


    const updated = await User.findByIdAndUpdate(user._id, { passwordResetToken }, { new: true })
    if(updated){
        return res.status(200).json({message:"Success", passwordResetToken,email:user.email})
    }
    else{
        return res.status(400).json({message:"Error updating"})
    }
    

    
}

exports.customerResetPassword = async (req, res) => {

    const { passwordResetToken, email, newPassword, confirmPassword } = req.body
    console.log( req.body.email)

    if (!passwordResetToken || !newPassword || !confirmPassword) {
        return res.status(422).json({ message: "Please enter your new password" })
    }
    if (newPassword === confirmPassword) {
        const userDetails = await User.findOne({ email: email })
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
            );
            return res.status(200).json({ message: 'Success' });
            
        }
        else{
            return res.status(422).json({ message: "Invalid session" })
        }
       
    }
    else {
        return res.status(422).json({ message: "Passwords doesn't match" })
    }
}

exports.customerLogout = (req, res) => {
    let { userId } = req.body
    let updateUser = User.findOneAndUpdate(userId, { device_token: null }, { new: true })
    
    req.user = null
    res.status(200).json({
        message: "Logout Success",
    })
}

exports.getCustomerProfile = async (req, res) => {

    let getUser = await User.findById(req.user._id)
    res.status(200).json({
        message: "Success",
        response: getUser
    })

}

exports.updateProfile = async (req,res) =>{
    const {userId,email,name} = req.body
    const userUpdate =  await User.findOneAndUpdate({"_id":userId},{email,name},{new:true})
    if(userUpdate){
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


exports.custUpdatePassword =async(req,res)=>{
    const { email, newPassword, confirmPassword } = req.body
    console.log(email, newPassword, confirmPassword ,"email, newPassword, confirmPassword ")

    try {

        
    if ( !newPassword || !confirmPassword) {
        return res.status(422).json({ message: "Please enter your new password" })
    }
    if (newPassword === confirmPassword) {
        const userDetails = await User.findOne({ email: email })
        console.log(userDetails,"userdtals")
        if(userDetails){
        
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            // Update the user's password and passwordResetToken
            await User.findOneAndUpdate(
                { _id: userDetails._id },
                {
                password: hashedPassword,
                passwordResetToken: null,
                },
                { new: true }
            );
            return res.status(200).json({ message: 'Success' });
            
        }
        else{
            return res.status(422).json({ message: "Invalid session" })
        }
       
    }
    else {
        return res.status(422).json({ message: "Passwords doesn't match" })
    }
        
    } catch (error) {
        console.log(error)
    }

}