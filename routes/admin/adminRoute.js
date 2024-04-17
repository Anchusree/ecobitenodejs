const express = require("express")
const { adminLogout, getAdminProfile, adminUpdatePassword, adminUpdateEmail } = require("../../controllers/admin/adminAuthController")
const { requireSignIn, adminMiddleware } = require("../../middlewares/auth")
const { getAllUsers, getAllRestaurants, getOneRestaurant, getAdminDashboard, manageNotofications,custDeleteUser } = require("../../controllers/admin/adminManageUsers")
const { blockAndUnblockRestaurant, acceptRestaurant, rejectRestaurant, deleteRestaurant, getAllRestOrders } = require("../../controllers/admin/adminManageRest")
const { getAdminNotifications } = require("../../controllers/admin/adminNotification")
const adminRouter = express.Router()


adminRouter.get("/admin/dashboard",requireSignIn,adminMiddleware,getAdminDashboard)


adminRouter.get("/admin/getAllUsers",requireSignIn,adminMiddleware,getAllUsers)
adminRouter.get("/admin/getAllRestaurants",requireSignIn,adminMiddleware,getAllRestaurants)
adminRouter.get("/admin/blockAndUnblockRestaurant/:id",requireSignIn,adminMiddleware,blockAndUnblockRestaurant)
adminRouter.get("/admin/acceptRestaurant/:id",requireSignIn,adminMiddleware,acceptRestaurant)
adminRouter.get("/admin/rejectRestaurant/:id",requireSignIn,adminMiddleware,rejectRestaurant)
adminRouter.delete("/admin/deleteRestaurant/:id",requireSignIn,adminMiddleware,deleteRestaurant)
adminRouter.get("/admin/getAllRestOrders",requireSignIn,adminMiddleware,getAllRestOrders)

adminRouter.post("/admin/manageNotofications",manageNotofications)
adminRouter.get('/admin/getAdminNotifications/:id', getAdminNotifications)
adminRouter.get("/admin/getOneRestaurant/:id",requireSignIn,adminMiddleware,getOneRestaurant)



adminRouter.post("/admin/custDeleteUser",requireSignIn,adminMiddleware,custDeleteUser)
adminRouter.get("/admin/getProfile",requireSignIn,adminMiddleware,getAdminProfile)
adminRouter.post("/admin/updatePassword",requireSignIn,adminMiddleware,adminUpdatePassword)
adminRouter.post("/admin/updateEmail",requireSignIn,adminMiddleware,adminUpdateEmail)
adminRouter.post("/admin/logout",requireSignIn,adminMiddleware,adminLogout)



module.exports = adminRouter