const Cart = require("../../models/cartModel");
const Order = require("../../models/orderModel");
const Payment = require("../../models/paymentModel");
const Menu = require("../../models/menuModel");
const Notification = require("../../models/notificationModel");
const { createReserveCode, sendPushNotification } = require("../../utils/commonFunction");


exports.getOrderLists = async (req, res) => {

    try {
        const restaurantId = req.params.id;
        // console.log(restaurantId,"restaurantId")
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        //find prepared order lists
        const preparedLists = await Order.find({
            "restaurant_id": restaurantId, // Check if the restaurantId exists in the restaurants array
            "current_status":"pending",
            "order_status": {
                "$elemMatch": {
                    "status": "Preparing",
                    "isCompleted": true
                }
            }, "createdAt": { $gte: today }

        })
            .populate({
                path: 'cart_id',
                populate: {
                    path: 'cartItems.menu'
                }
            })
            .populate('user_id', 'name')
            .sort({ "-createdAt": -1 })

        //  console.log(preparedLists,"restaurantId")

        //find ready order lists
        const readyLists = await Order.find({
            "restaurant_id": restaurantId,
            "current_status":"completed",
            "order_status": {
                "$elemMatch": {
                    "status": "Ready",
                    "isCompleted": true
                }
            }, "createdAt": { $gte: today }
        })
            .populate({
                path: 'cart_id',
                populate: {
                    path: 'cartItems.menu'
                }
            })
            .populate('user_id', 'name')
            .sort({ "-createdAt": -1 })
        //find cancelled order lists
        const cancelledLists = await Order.find({
            "restaurant_id": restaurantId,
            "current_status": "cancelled",
            "order_status": {
                "$elemMatch": {
                    "status": "Cancelled",
                    "isCompleted": true
                }
            }, "createdAt": { $gte: today }
        })
            .populate({
                path: 'cart_id',
                populate: {
                    path: 'cartItems.menu'
                }
            })
            .populate('user_id', 'name ')
            .sort({ "-createdAt": -1 })

        // console.log(cancelledLists,"cancelledLists")

        if (preparedLists && readyLists && cancelledLists) {
            res.status(200).json({ message: "Success", preparedLists, readyLists, cancelledLists })
        }
        else {
            res.status(404).json({ message: "No order lists found!" });
        }



    } catch (error) {
        console.error("Error fetching prepared lists:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.markAsPrepared = async (req, res) => {
    const orderId = req.params.id;
    const expotoken = req.body.expotoken
    const userId = req.body.userId

    const findOrder = Order.findById(orderId)

    const reserv_code = await createReserveCode()
    const orderStatus = [
        {
            status: "Preparing",
            isCompleted: false
        },
        {
            status: "Ready",
            isCompleted: true
        },
        {
            status: "Cancelled",
            date: new Date(),
            isCompleted: false
        },
        {
            status: "Completed",
            date: new Date(),
            isCompleted: false
        }
    ];

    const updateOrder = await Order.findByIdAndUpdate(orderId,
        {
            $set: {
                "order_status": orderStatus, "reservation_code.code": reserv_code.code,
                "reservation_code.expiredTime": reserv_code.expiredTime, "reservation_code.orderId": orderId
            }
        },
        { new: true })

    if (updateOrder) {
        const addNotification = new Notification({
            title: "Your order is ready.",
            message: "Your order is ready for pickup.",
            user_id: userId,
            notificationType: 2
        })
        await addNotification.save()
        await sendPushNotification(userId, "Your order is ready.", "Your order is ready for pickup.", expotoken);
        res.status(200).json({ message: "Success", updateOrder })
    }
    else {
        res.status(400).json({ message: "Order not found" })
    }


}

exports.restoreItem = async (req, res) => {
    try {
        const orderId = req.body.orderId
        const cartId = req.body.cartId
        const cartItems = req.body.cartItem

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Find the order
        const order = await Order.findById(orderId).populate('cart_id');
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order) {
            for (const cartitem of cartItems) {
                //console.log(cartitem,"cartitm")
                await Menu.findByIdAndUpdate(cartitem.menu._id, { $inc: { stock_quantity: 1 } });

                const updateCart = await Cart.findOneAndUpdate(
                    { "_id": cartId, "user_id": userId, "cartItems.menu": cartitem.menu._id },
                    { $pull: { cartItems: { menu: cartitem.menu._id } } },
                    { new: true }
                )
                if (updateCart) {
                    console.log("sattus changed to cncld")

                    await Order.deleteOne({ "_id": orderId })
                    await Payment.deleteOne({ "order_id": orderId })
                }
            }
        }

    }
    catch (error) {
        throw error;
    }
}