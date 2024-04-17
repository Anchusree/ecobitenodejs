const Order = require("../../models/orderModel")
const Restaurant = require("../../models/restaurantModel")



exports.blockAndUnblockRestaurant = async (req, res) => {
    const id = req.params.id
    let findRestaurant = await Restaurant.findById(id)
    if (findRestaurant.isBlocked === 1) {//if its already blocked make it unblock
        let unblockRestaurant = await Restaurant.findByIdAndUpdate(
            { _id: id }, { isBlocked: 0 }, { new: true })
        res.status(200).json({ message: "Success", msg: "Unblocked Successfully" })
    }
    else { //if its already unblocked make it blocked
        let blockRestaurant = await Restaurant.findByIdAndUpdate(
            { _id: req.body.id }, { isBlocked: 1 }, { new: true })
        res.status(200).json({ message: "Success", msg: "Blocked Successfully" })
    }
}

exports.acceptRestaurant = async (req, res) => {
    const id = req.params.id
    let acceptRestaurant = await Restaurant.findByIdAndUpdate({ _id: id }, { restaurantStatus: 'Accepted' }, { new: true })
    let pendingList
    if (acceptRestaurant) {
        pendingList = await Restaurant.find({ restaurantStatus: "Pending" })
    }

    res.status(200).json({ message: "Success", msg: "Restaurant Accepted Successfully", acceptRestaurant, pendingList })


}

exports.rejectRestaurant = async (req, res) => {
    const id = req.params.id
    let rejectRestaurant = await Restaurant.findByIdAndUpdate({ _id: id }, { restaurantStatus: 'Rejected' }, { new: true })
    let pendingList
    if (rejectRestaurant) {
        pendingList = await Restaurant.find({ restaurantStatus: "Pending" })
    }
    res.status(200).json({ message: "Success", msg: "Restaurant Rejected Successfully", rejectRestaurant, pendingList })


}

exports.deleteRestaurant = async (req, res) => {
    const id = req.params.id
    console.log(id,"id")
    let delRest = await Restaurant.findByIdAndDelete({ _id: id })
    let pendingList;
    let acceptedList;
    let rejectedList
    if (delRest) {
        pendingList = await Restaurant.find({ restaurantStatus: "Pending" })
        acceptedList = await Restaurant.find({ restaurantStatus: "Accepted" })
        rejectedList = await Restaurant.find({ restaurantStatus: "Rejected" })
    }
    res.status(200).json({ message: "Success", msg: "Restaurant Rejected Successfully", acceptedList, rejectedList, pendingList })

}

exports.getAllRestOrders = async (req, res) => {

    const getOrders = await Order.find({})
        .select('restaurant_id total_amount')
        .populate('restaurant_id', 'restaurantName');
    console.log(getOrders,"getOrders")

    // Function to calculate total orders and total prices based on restaurantId
    function calculateTotals(orders) {
        const totals = {};
        orders.forEach(order => {
            const restaurantId = order.restaurant_id._id;
            const restaurantName = order.restaurant_id.restaurantName;
            const totalAmount = order.total_amount;
            if (!totals[restaurantId]) {
                totals[restaurantId] = {
                    name:restaurantName,
                    totalOrders: 0,
                    totalPrice: 0
                };
            }
            totals[restaurantId].totalOrders++;
            totals[restaurantId].totalPrice += totalAmount;
        });
        return totals;
    }

    let totalOrderList = []
    // Calculate totals
    const orderLists = calculateTotals(getOrders);
    totalOrderList.push(orderLists)

    res.status(200).json({ message: "Success", totalOrderList:totalOrderList })

}