const Cart = require("../../models/cartModel")
const Menu = require("../../models/menuModel");
const Order = require("../../models/orderModel");
const Restaurant = require("../../models/restaurantModel");
const { sendPushNotification } = require("../../utils/commonFunction");



exports.addToCart = async (req, res) => {

    const { cartItems, userId } = req.body
    //console.log(cartItems, userId,expotoken,"cartItemssss")

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cart = await Cart.findOne({ "user_id": userId, createdAt: { $gte: today } })
    const menus = cartItems.find(m => m.menu)
    // console.log(menus,"menus")


    if (cart) {
        await Menu.findByIdAndUpdate(menus.menu, { stock_quantity: menus.stock }, { new: true })

        const item = cart.cartItems && cart.cartItems.find(c => c.menu == menus.menu)

        //if item exist in cart, update  qty
        if (item) {
            console.log("update qty_ tem")
            let existCart = await Cart.findOneAndUpdate({ "user_id": userId, "cartItems.menu": item.menu, createdAt: { $gte: today } }, {
                "$set": {
                    "cartItems.$": {
                        ...cartItems,
                        quantity: menus.quantity,
                        price: menus.quantity * menus.price,
                        subtotal: menus.subtotal,
                        menu: menus.menu,
                        status: "pending"
                    }
                }
            }, { new: true })
            if (existCart) {
                const _cart_ = await Cart.findOne({ user_id: userId, createdAt: { $gte: today } })
                    .populate("cartItems.menu", "_id food_name food_image new_price stock_quantity restaurant_id")
                    .populate({
                        path: 'cartItems.menu',
                        populate: {
                            path: 'restaurant_id',
                            select: 'restaurantName open_close_status open_close_time' // Select the fields you want from the restaurant document
                        }
                    });

                return res.status(201).json({ cart: _cart_ })
            }
        }
        else {
            console.log("exist bt new menu")
            // If the item does not exist in the cart, add it to the cart
            let newmenu = await Cart.findOneAndUpdate({ "user_id": userId, createdAt: { $gte: today } }, {
                "$push": {
                    "cartItems": cartItems
                }
            }, { new: true })
            if (newmenu) {
                const _cart_ = await Cart.findOne({ user_id: userId, createdAt: { $gte: today } })
                    .populate("cartItems.menu", "_id food_name food_image new_price stock_quantity restaurant_id")
                    .populate({
                        path: 'cartItems.menu',
                        populate: {
                            path: 'restaurant_id',
                            select: 'restaurantName open_close_status open_close_time' // Select the fields you want from the restaurant document
                        }
                    });

                return res.status(201).json({ cart: _cart_ })
            }
        }
        // }
        // Return the updated cart
        return res.status(200).json({ cart: newmenu });

    }
    else {
        console.log("new cart")

        await Menu.findByIdAndUpdate(menus.menu, { stock_quantity: menus.stock }, { new: true })
        console.log(menus, "menus")
        //if cart not exists, then create a new cart
        const cart = new Cart({
            user_id: userId,
            cartItems: [{
                ...cartItems,
                quantity: menus.quantity,
                price: menus.quantity * menus.price,
                subtotal: menus.subtotal,
                menu: menus.menu,
                status: "pending",
            }]
        })
        await cart.save()

        if (cart) {
            const _cart_ = await Cart.findOne({ user_id: userId, createdAt: { $gte: today } })
                .populate("cartItems.menu", "_id food_name food_image new_price stock_quantity restaurant_id")
                .populate({
                    path: 'cartItems.menu',
                    populate: {
                        path: 'restaurant_id',
                        select: 'restaurantName open_close_status open_close_time' // Select the fields you want from the restaurant document
                    }
                });


            return res.status(200).json({ cart: _cart_ });
        }
    }
};
// Function to calculate subtotal for each item
const calculateSubtotal = (item) => {
    return item.quantity * item.price;
};

exports.getCartItems = async (req, res) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const id = req.params.id
    try {
        const cart = await Cart.findOne({ user_id: id, createdAt: { $gte: today }, 'cartItems.status': 'pending' })
            .populate("cartItems.menu", "_id food_name food_image new_price stock_quantity restaurant_id")
            .populate({
                path: 'cartItems.menu',
                populate: {
                    path: 'restaurant_id',
                    select: 'restaurantName open_close_status open_close_time' // Select the fields you want from the restaurant document
                }
            });
        if (cart) {

            const cartByRestaurants = await Promise.all(cart.cartItems.map(async menuItem => {
                //console.log(menuItem.restaurant_id, "menuItem.restaurant_id");
                const restaurant = await Restaurant.findById(menuItem.menu.restaurant_id._id);
                if (restaurant && restaurant.open_close_status === 'Open') {
                    return menuItem;
                }
            }));

            // Filter out any undefined values from the map operation
            const filteredCarts = cartByRestaurants.filter(menuItem => menuItem !== undefined);

            // Calculate total subtotal
            const totalSubtotal = cart.cartItems.filter((cart) => cart.status === "pending").reduce((total, item) => {
                return total + calculateSubtotal(item);
            }, 0);

            if (filteredCarts.length > 0) {
                res.status(200).json({ message: "Success", cartList: cart, totalSubtotal })
            }
            else {
                for (const cartItem of cart.cartItems) {
                    const menuId = cartItem.menu._id;
                    await Menu.findByIdAndUpdate(menuId, { $inc: { stock_quantity: 1 } });
                }

                // Delete
                await Cart.deleteOne({ "_id": cart._id })
                res.status(200).json({ message: "Success", cartList: [], totalSubtotal })
            }
        }
        else {
            res.status(400).json({ message: "No cartItems found" })

        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}


exports.removeCartItems = async (req, res) => {

    const { menuId, userId, cartId } = req.body

    const today = new Date();
    today.setHours(0, 0, 0, 0);


    try {
        if (menuId) {
            await Menu.findByIdAndUpdate(menuId, { $inc: { stock_quantity: 1 } });

            const deleteCart = await Cart.findOneAndUpdate({ "_id": cartId, "user_id": userId, createdAt: { $gte: today } }, {
                $pull: {
                    cartItems: {
                        menu: menuId
                    }
                }
            }, { new: true })
            if (deleteCart) {
                cosnole.log("delete cart")
                const cart = await Cart.findOne({ "_id": cartId, "user_id": userId, createdAt: { $gte: today } })
                    .populate("cartItems.menu", "_id food_name food_image new_price stock_quantity restaurant_id")
                    .populate({
                        path: 'cartItems.menu',
                        populate: {
                            path: 'restaurant_id',
                            select: 'restaurantName open_close_status open_close_time' // Select the fields you want from the restaurant document
                        }
                    });

                return res.status(201).json({ message: "Success", cartList: cart })
            }
            else {
                return res.status(400).json({ message: "Delete error" })
            }
        }
        else {
            return res.status(400).json({ message: "Menu not found" })
        }

    } catch (error) {
        return res.status(400).json({ message: "Something went wrong" })
    }


}

exports.updateCartQty = async (req, res) => {
    const userId = req.body.userId
    const item = req.body.item
    const cartId = req.body.cartId

    //console.log(userId,item,cartId,"cc")

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let existCart = await Cart.findOneAndUpdate({ "_id": cartId, "user_id": userId, "cartItems.menu": item.menu, "cartItems._id": item._id, createdAt: { $gte: today } }, {
            "$set": {
                "cartItems.$": {
                    _id: item._id,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.subtotal,
                    menu: item.menu
                }
            }
        }, { new: true })
        if (existCart) {
            const _cart_ = await Cart.findOne({ "_id": cartId, user_id: userId })
                .populate("cartItems.menu", "_id food_name food_image new_price stock_quantity")
                .populate({
                    path: 'cartItems.menu',
                    populate: {
                        path: 'restaurant_id',
                        select: 'restaurantName open_close_status open_close_time' // Select the fields you want from the restaurant document
                    }
                });

            return res.status(201).json({ cart: _cart_ })
        }

    } catch (error) {
        consoel.log(error.message)
        return res.status(201).json({ message: "Something went wrong" })
    }


}


exports.getSubTotal = async (req, res) => {

    const id = req.params.id
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const cartList = await Cart.find({ "user_id": id, createdAt: { $gte: today } })
            .populate("cartItems.menu", "_id food_name food_image new_price stock_quantity")

        //console.log(cartList[0].cartItems,"cartListll")

        if (cartList.length > 0) {

            let totalSubtotal = cartList && cartList[0].cartItems.filter((cart) => cart.status === "pending").reduce((total, item) => {
                return total + item.subtotal;
            }, 0)
            return res.status(201).json({ cartList: cartList, totalSubtotal })
        }
        else {
            return res.status(401).json({ cartList: [], totalSubtotal: 0 })
        }

    } catch (error) {
        console.log("error", error.message)
        return res.status(400).json({ message: "Something went wrong" })
    }


}


exports.findCartOrder = async (req, res) => {

    try {
        const cartId = req.params.id

        const findOrder = await Order.find({ "cart_id": cartId, "current_status": "pending" })
            .populate({
                path: 'cart_id',
                populate: {
                    path: 'cartItems.menu'
                }
            })
            .populate('restaurant_id', 'restaurantName open_close_status open_close_time')
            .sort({ order_date: -1 }); // Sorting by orderDate in descending order (latest first)
        //console.log(orderList, "orderList")

        // console.log(findOrder,"findOrder")
        if (!findOrder) {
            res.status(400).json({ message: "Order Not found" });
        }

        res.status(200).json({ message: "Success", orderList: findOrder });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }


}
