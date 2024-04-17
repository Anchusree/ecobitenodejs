const express = require("express")
const { registerCustomer, loginCustomer, customerForgotPassword, customerResetPassword, customerLogout, getCustomerProfile, updateProfile, custUpdatePassword } = require("../../controllers/customers/customerAuthController")
const { requireSignIn, customerMiddleware } = require("../../middlewares/auth")
const { addToCart, getCartItems, removeCartItems, updateCartQty, getSubTotal, findCartOrder } = require("../../controllers/customers/CartController")
const { addOrder, cancelOrder, getAllOrders, custCompleteOrder, cancelOrderCartItem } = require("../../controllers/customers/orderController")
const { getReviews, writeReviews } = require("../../controllers/customers/reviewController")
const { getAllRestMenus, getAllRestaurantsAndMenus, getTodaysMenu, getTopRatedRestaurant, getAllMenusByRestaurant } = require("../../controllers/customers/custHomeController")
const { getCustNotifications } = require("../../controllers/customers/notoficationController")
const customerRouter = express.Router()


customerRouter.post("/customer/register", registerCustomer)
customerRouter.post("/customer/login", loginCustomer)
customerRouter.post("/customer/forgotPassword", customerForgotPassword)
customerRouter.post("/customer/resetPassword", customerResetPassword)

customerRouter.get("/customer/getTodaysMenu", getTodaysMenu)
customerRouter.get("/customer/getTopRatedRestaurant", requireSignIn, customerMiddleware, getTopRatedRestaurant)

customerRouter.get("/customer/getAllMenusByRestaurant/:id", requireSignIn, customerMiddleware, getAllMenusByRestaurant)

customerRouter.post("/customer/getAllRestMenus/:id", requireSignIn, customerMiddleware, getAllRestMenus)
customerRouter.get("/customer/getAllRestaurantsAndMenus", requireSignIn, customerMiddleware, getAllRestaurantsAndMenus)

customerRouter.post("/customer/addtocart", requireSignIn, customerMiddleware, addToCart)
customerRouter.get("/customer/getCartItems/:id",requireSignIn, customerMiddleware, getCartItems)
customerRouter.post("/customer/removeCartItems", requireSignIn, customerMiddleware, removeCartItems)
customerRouter.post("/customer/updateCartQty", requireSignIn, customerMiddleware, updateCartQty)
customerRouter.get("/customer/getSubTotal/:id", requireSignIn, customerMiddleware, getSubTotal)


customerRouter.post("/customer/cancelOrderCartItem",requireSignIn, customerMiddleware,cancelOrderCartItem)

customerRouter.get("/customer/findCartOrder/:id", requireSignIn, customerMiddleware, findCartOrder)
customerRouter.get("/customer/getAllOrders/:id", requireSignIn, customerMiddleware, getAllOrders)

customerRouter.get("/customer/getCustNotifications/:id", requireSignIn, customerMiddleware, getCustNotifications)



customerRouter.post("/customer/addOrder",requireSignIn, customerMiddleware,addOrder)
customerRouter.post("/customer/cancelOrder", requireSignIn, customerMiddleware, cancelOrder)
customerRouter.post("/customer/completeOrder", requireSignIn, customerMiddleware, custCompleteOrder)

customerRouter.post("/customer/writeReview", requireSignIn, customerMiddleware, writeReviews)
customerRouter.get("/customer/getReviews/:id", requireSignIn, customerMiddleware, getReviews)

customerRouter.post("/customer/logout", requireSignIn, customerMiddleware, customerLogout)
customerRouter.get("/customer/getProfile", requireSignIn, customerMiddleware, getCustomerProfile)


customerRouter.post("/customer/updateProfile", requireSignIn, customerMiddleware, updateProfile)

customerRouter.post("/customer/custUpdatePassword", requireSignIn, customerMiddleware, custUpdatePassword)


module.exports = customerRouter