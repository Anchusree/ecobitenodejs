const Cart = require("../../models/cartModel");
const Menu = require("../../models/menuModel");
const Notification = require("../../models/notificationModel");
const Order = require("../../models/orderModel")
const Payment = require("../../models/paymentModel");
const Restaurant = require("../../models/restaurantModel");
const User = require("../../models/userModel");
const { sendPushNotification } = require("../../utils/commonFunction");

exports.addOrder = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const userId = req.body.userId
        const cartId = req.body.cartId
        const expotoken = req.body.expotoken

        // console.log(userId,cartId,"dddd")
        // Find the cart of the user
        const cart = await Cart.find({ "_id": cartId, "user_id": userId, createdAt: { $gte: today } })
            .populate("cartItems.menu", "_id food_name food_image new_price stock_quantity restaurant_id")
            .populate({
                path: 'cartItems.menu',
                populate: {
                    path: 'restaurant_id',
                    select: 'restaurantName open_close_status open_close_time' // Select the fields you want from the restaurant document
                }
            });

        let existCart = await Cart.findOneAndUpdate({ "_id": cartId, "user_id": userId, createdAt: { $gte: today } },
            { $set: { "cartItems.$[].status": "ordered" } }, { new: true })

        if (existCart) {
            console.log("status changed to ordered")

            const updateOrder = await Cart.findByIdAndUpdate(cartId,
                {
                    $set: {
                        "cartItems": existCart.cartItems,
                    }
                },
                { new: true })
            if (updateOrder) {
                console.log("changed cartitm")
            }

        }

        if (cart) {
            // Group cart items by restaurant
            const cartItemsByRestaurant = [];
            cart[0].cartItems.forEach(item => {
                const restaurantId = item.menu.restaurant_id._id.toString();
                if (!cartItemsByRestaurant.includes(restaurantId)) {
                    cartItemsByRestaurant.push(restaurantId);
                }
            });

            let filteredCartItemsByRestaurant = [...new Set(cartItemsByRestaurant)];

            // Define order status
            const orderStatus = [
                { status: "Preparing", date: new Date(), isCompleted: true },
                { status: "Ready", isCompleted: false },
                { status: "Cancelled", isCompleted: false },
                { status: "Completed", isCompleted: false },
            ];
            const createdOrders = [];
            // Create orders for each restaurant
            for (const restaurantId of filteredCartItemsByRestaurant) {
                const order = new Order({
                    total_amount: req.body.total_amount,
                    order_date: new Date(),
                    user_id: userId,
                    cart_id: cartId,
                    order_status: orderStatus,
                    paymentType: req.body.paymentType,
                    restaurant_id: restaurantId
                });
                const savedOrder = await order.save();
                createdOrders.push(savedOrder);

                // Save payment details based on payment type
                if (req.body.paymentType === 'cod') {
                    const codpayment = new Payment({
                        payment_amount: req.body.total_amount,
                        paymentType: "cod",
                        payment_status: "Completed",
                        payment_date: new Date(),
                        user_id: userId,
                        order_id: savedOrder._id
                    });
                    await codpayment.save();
                } else if (req.body.paymentType === 'card') {
                    const lastFourDigits = req.body.cardNumber.slice(-4);
                    const maskedCardNumber = "*".repeat(req.body.cardNumber.length - 4) + lastFourDigits;

                    const cardpayment = new Payment({
                        payment_amount: req.body.total_amount,
                        paymentType: "card",
                        payment_status: "Completed",
                        payment_date: new Date(),
                        user_id: userId,
                        order_id: savedOrder._id,
                        cardNumber: maskedCardNumber,
                        expiredBy: req.body.expiredBy || "0",
                        cvv: req.body.cvv || 0
                    });
                    await cardpayment.save();
                }

                const addNotificationToUser = await new Notification({
                    title: "Order placed successfully.",
                    message: "Your order has been received.Your order is preparing.",
                    user_id: userId,
                    notificationType: 2
                })
                await addNotificationToUser.save()
                await sendPushNotification(userId, 
                    `${savedOrder._id} Order placed successfully.`, 
                    "Your order has been received.Your order is preparing.", expotoken);


                const findRest = await Restaurant.find({ _id: restaurantId })
                const restuser = await User.find({ "_id": findRest[0].user_id })


                const addNotificationToRestaurant = await new Notification({
                    title: "Order placed",
                    message: `An order has been placed. Order Id :${savedOrder._id}`,
                    user_id: findRest[0]._id,
                    notificationType: 2
                })
                await addNotificationToRestaurant.save()
               
                //   // Send notification to the user that item was added to the cart
                await sendPushNotification(restuser[0]._id, "Order received.", `An order has been placed. Order Id: ${savedOrder._id}`, expotoken);
            }
            res.status(200).json({ message: "Success", result: createdOrders });
        }


    } catch (error) {
        console.log(error, "error")
        res.status(400).json({ error: error.message });
    }
};

exports.cancelOrder = async (req, res) => {

    try {
        // Extract cartId from request body
        const { cartId, userId, orderId } = req.body;
        console.log(cartId, userId, "cartId, userId")

        let existCart = await Cart.findOneAndUpdate({ "_id": cartId, "user_id": userId, createdAt: { $gte: today } },
            { $set: { "cartItems.$[].status": "pending" } }, { new: true })

        if (existCart) {
            console.log("cart status changed")
        }

        const findOrder = await Order.find({ "_id": orderId, "cart_id": cartId })
        // console.log(findOrder, "findordr")
        if (findOrder) {

            const orderStatus = [
                {
                    status: "Preparing",
                    isCompleted: false
                },
                {
                    status: "Ready",
                    isCompleted: false
                },
                {
                    status: "Cancelled",
                    date: new Date(),
                    isCompleted: true
                },
                {
                    status: "Completed",
                    date: new Date(),
                    isCompleted: false
                }
            ];

            const updateOrder = await Order.findOneAndUpdate({ "_id": orderId, "cart_id": cartId },
                { $set: { "order_status": orderStatus, "current_status": "cancelled" } },
                { new: true })
            if (updateOrder) {
                res.status(200).json({ message: "Success", updateOrder })
            }
            else {
                res.status(400).json({ message: "Order not found" })
            }

        }

    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: error.message });
    }

}

exports.custCompleteOrder = async (req, res) => {

    try {

        console.log("completeorder")

        const orderId = req.body.orderId;
        const cartId = req.body.cartId
    
        //console.log(orderId,cartId,"cartIddd")
    
        const orderStatus = [
            {
                status: "Preparing",
                isCompleted: false
            },
            {
                status: "Ready",
                isCompleted: false
            },
            {
                status: "Cancelled",
                date: new Date(),
                isCompleted: false
            },
            {
                status: "Completed",
                date: new Date(),
                isCompleted: true
            }
        ];
    
        const updateOrder = await Order.findByIdAndUpdate(orderId,
            {
                $set: {
                    "order_status": orderStatus,
                    "reservation_code.code": "null", "reservation_code.expiredTime": "0", "current_status": "completed"
                }
            },
            { new: true })
    
        if (updateOrder) {
            console.log(updateOrder,"updte")
    
            // await Cart.findByIdAndDelete({ "_id": cartId })
            //console.log(deleteorder,"deleteorder")
    
            res.status(200).json({ message: "Success", msg: "Order Completed" })
        }
        else {
            res.status(400).json({ message: "Order not found" })
        }
        
    } catch (error) {
        console.log(error)
        
    }
  

}

exports.getAllOrders = async (req, res) => {

    const userId = req.params.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orderList = await Order.find({ "user_id": userId, "current_status": "pending" })
        .populate({
            path: 'cart_id',
            populate: {
                path: 'cartItems.menu'
            }
        })
        .populate('restaurant_id', 'restaurantName open_close_status open_close_time')
        .sort({ order_date: -1 }); // Sorting by orderDate in descending order (latest first)
    //console.log(orderList, "orderList")


    res.status(200).json({ message: "Success", orderList: orderList });


}

exports.cancelOrderCartItem = async (req, res) => {

    const { orderId, userId, cartId, cartItemList } = req.body
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {

        const findOrder = await Order.find({ "_id": orderId, "cart_id": cartId })
        // console.log(findOrder, "findordr")
        if (findOrder) {

            // const orderStatus = [
            //     {
            //         status: "Preparing",
            //         isCompleted: false
            //     },
            //     {
            //         status: "Ready",
            //         isCompleted: false
            //     },
            //     {
            //         status: "Cancelled",
            //         date: new Date(),
            //         isCompleted: true
            //     },
            //     {
            //         status: "Completed",
            //         date: new Date(),
            //         isCompleted: false
            //     }
            // ];

            // const updateOrder = await Order.findOneAndUpdate({ "_id": orderId, "cart_id": cartId },
            //     { $set: { "order_status": orderStatus, "current_status": "cancelled" } },
            //     { new: true })
            await Payment.deleteOne({ "order_id": orderId })
            await Order.deleteOne({"_id":orderId})

            // if (updateOrder) {
            //     res.status(200).json({ message: "Success", updateOrder })
            // }
            // else {
            //     res.status(400).json({ message: "Order not found" })
            // }

        }

        for (const cartitem of cartItemList) {
            await Menu.findOneAndUpdate({"_id":cartitem.menu._id}, { $inc: { stock_quantity: 1 } });

            const updateCart = await Cart.findOneAndUpdate(
                { "_id": cartId, "user_id": userId, "cartItems._id": cartitem._id },
                {
                    $set: {
                        "cartItems.$.status": "cancelled",
                    }
                },
                { new: true }
            )
            if (!updateCart) {
                console.log("Cart not found or cart item not updated.");
                // Handle the case where the cart or cart item is not found
            } else {
                console.log("Cart item status updated successfully.");
                 await Cart.findOneAndUpdate({ "_id": cartId, "user_id": userId,"cartItems._id": cartitem._id}, {
                    $pull: {
                        cartItems: {
                            menu: cartitem.menu._id
                        }
                    }
                }, { new: true })
                // Handle the case where the cart item status is successfully updated
            }

         
        }
    }
    catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal error" })
    }


}