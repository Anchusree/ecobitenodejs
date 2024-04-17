const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

// exports.requireSignIn = async (req,res,next)=>{
//     if(req.headers.authorization){
//         const token = await req.headers.authorization.split(" ")[1]
//         const secretKey ="secret_ecobite_token"
//         //console.log(token);
//         if(!token) {
//             return res.status(400).json({message:"Invalid Authorization"})
//         }

//         const decoded = await jwt.verify(token, secretKey, (err, decoded) => {
//             if (err) {
//               console.error('JWT verification failed:', err.message);
//               // Handle the error gracefully
//             } else {
//               //console.log('Decoded JWT payload:', decoded);
//               // Token is valid, proceed with your logic
//             }
//           });
//         if(!decoded) return res.status(400).json({message:"Invalid Authorization"})

//         const user = await User.findOne({_id:decoded.id})
//         if(user){
//             req.user = user
//         }
//         else{
//             return res.status(400).json({message:"User not found"})
//         }
       
//     }
//     else{
//         return res.status(400).json({message:"Session Exipred, Login Required"})
//     }
//     next();
// }

exports.requireSignIn = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(400).json({ message: "Session Expired, Login Required" });
        }

        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(400).json({ message: "Invalid Authorization" });
        }

        const decoded = await jwt.verify(token,"secret_ecobite_token");
        if (!decoded) {
            return res.status(400).json({ message: "Invalid Authorization" });
        }

        const user = await User.findOne({ _id: decoded.id });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.customerMiddleware = (req,res,next)=>{
    if(req.user.role !== "customer"){
        return res.status(400).json({message:"Customer Access Denied"})
    }
    next();
}
exports.adminMiddleware = (req,res,next)=>{
    if(req.user.role !== "admin"){
        return res.status(400).json({message:"Access Denied"})
    }
    next();
}
exports.restaurantMiddleware = (req,res,next)=>{
    if(req.user.role !== "restaurant"){
        return res.status(400).json({message:"Restaurant Access Denied"})
    }
    next();
}

exports.createAccessToken = (payload)=>{
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1d'})
}
