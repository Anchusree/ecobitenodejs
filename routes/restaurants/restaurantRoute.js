const express = require("express")
const { registerRestaurant, loginRestaurant, restaurantForgotPassword, restaurantResetPassword, restaurantLogout, getRestaurantProfile, updateRestHour, resetPasswordFromProfile, restUpdateProfile } = require("../../controllers/restaurants/restaurantAuthController")
const { requireSignIn, restaurantMiddleware } = require("../../middlewares/auth")
const { addCategory, editCategory, deleteCategory, getCategory, restDashboard, geAllCategory } = require("../../controllers/restaurants/restaurantCategoryController")
const { addMenu, blockAndUnblockMenu, deleteMenu, editMenu, getMenu } = require("../../controllers/restaurants/restaurantMenuController")
const { getPreparedLists, getReadyLists, getCancelledLists, getOrderLists, markAsPrepared, restoreItem } = require("../../controllers/restaurants/restaurantOrders")
const { getRestPayments } = require("../../controllers/restaurants/restaurantPayment")
const { getRestNotifications } = require("../../controllers/restaurants/restNotificationController")
const restaurantRouter = express.Router()


restaurantRouter.post("/restaurant/registerRestaurant",registerRestaurant)
restaurantRouter.post("/restaurant/loginRestaurant",loginRestaurant)
restaurantRouter.post("/restaurant/forgotPassword",restaurantForgotPassword)
restaurantRouter.post("/restaurant/resetPassword",restaurantResetPassword)

restaurantRouter.get("/restaurant/dashboard/:id",requireSignIn,restaurantMiddleware, restDashboard)
restaurantRouter.get("/restaurant/getCategory/:id",requireSignIn,restaurantMiddleware, getCategory)
restaurantRouter.post("/restaurant/addCategory",requireSignIn,restaurantMiddleware, addCategory)
restaurantRouter.post("/restaurant/editCategory",requireSignIn,restaurantMiddleware, editCategory)
restaurantRouter.delete("/restaurant/deleteCategory/:id",requireSignIn,restaurantMiddleware, deleteCategory)

restaurantRouter.get("/restaurant/getMenu/:id",requireSignIn,restaurantMiddleware, getMenu)
restaurantRouter.post("/restaurant/addMenu",requireSignIn,restaurantMiddleware,addMenu)
restaurantRouter.post("/restaurant/editMenu",requireSignIn,restaurantMiddleware,editMenu)
restaurantRouter.post("/restaurant/blockAndUnblockMenu",requireSignIn,restaurantMiddleware,blockAndUnblockMenu)
restaurantRouter.post("/restaurant/deleteMenu/:id",requireSignIn,restaurantMiddleware, deleteMenu)

restaurantRouter.get("/restaurant/getOrderLists/:id",requireSignIn,restaurantMiddleware, getOrderLists)
restaurantRouter.post("/restaurant/markAsPrepared/:id",requireSignIn,restaurantMiddleware, markAsPrepared)
restaurantRouter.post("/restaurant/restoreItem",requireSignIn,restaurantMiddleware, restoreItem)

restaurantRouter.get("/restaurant/getRestPayments/:id",requireSignIn,restaurantMiddleware,getRestPayments)

restaurantRouter.get('/restaurant/getRestNotifications/:id',requireSignIn,restaurantMiddleware, getRestNotifications)

restaurantRouter.get("/restaurant/getProfile/:id",requireSignIn,restaurantMiddleware,getRestaurantProfile)
restaurantRouter.post("/restaurant/updateRestHour",requireSignIn,restaurantMiddleware,updateRestHour)
restaurantRouter.post("/restaurant/resetPasswordFromProfile",requireSignIn,restaurantMiddleware,resetPasswordFromProfile)
restaurantRouter.post("/restaurant/restUpdateProfile",requireSignIn,restaurantMiddleware,restUpdateProfile)

restaurantRouter.post("/restaurant/logout",requireSignIn,restaurantMiddleware,restaurantLogout)

module.exports = restaurantRouter