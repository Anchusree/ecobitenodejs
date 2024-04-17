const Category = require("../../models/categoryModel")
const Menu = require("../../models/menuModel")
const Restaurant = require("../../models/restaurantModel")

exports.getMenu = async (req, res) => {
    try {
        //console.log("findMenu")
        const id = req.params.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysMenuList = await Menu.find({ restaurant_id: id, createdAt: { $gte: today } })
        .populate('restaurant_id', 'restaurantName open_close_time open_close_status rating')
        .populate('category_id','category_name category_image')
        .populate('restaurant_id.rating', 'rating review');
        //console.log(todaysMenuList,"findMenu")
       
        if (todaysMenuList.length > 0) {
            return res.status(200).json({
                message: "Success",
                todaysMenuList
            });
        } else {
            return res.status(404).json({
                message: "No menus found for today"
            });
        }
    } catch (error) {
        console.error('Error fetching menus:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.addMenu = async (req, res) => {
    let { restaurantId, foodName, foodDescription, foodImage, stockQuantity, originalPrice, discount, newPrice, categoryId } = req.body
    console.log(req.body)
    if (!foodName || !foodDescription || !foodImage || !stockQuantity || !originalPrice || !discount || !categoryId) {
        return res.status(400).json({ message: "Please fill all the fields" })
    }
    const findMenu = await Menu.findOne({ food_name: foodName })
    if (findMenu) {
        return res.status(422).json({ message: "This menu already exists!" })
    }
    const menu = await new Menu({
        restaurant_id: restaurantId,
        category_id: categoryId,
        food_name: foodName,
        food_description: foodDescription,
        food_image: foodImage,
        stock_quantity: stockQuantity,
        original_price: originalPrice,
        discount_price: discount,
        new_price: newPrice
    })
    menu.save()

    if (menu) {
        const menuResults = await Menu.find({ restaurant_id: restaurantId })
        return res.status(201).json({ message: "Success", results: menuResults })
    }


}

exports.editMenu = async (req, res) => {

    console.log(req.body,"bdy")
    const findMenu = await Menu.findByIdAndUpdate(req.body.menuId, req.body, { new: true })
    if (findMenu) {
        return res.status(201).json({ message: "Success", results: findMenu })
    }
    else {
        return res.status(422).json({ message: "No menu found!" })
    }
}


exports.blockAndUnblockMenu = async (req, res) => {
    let findMenu = await Menu.findById({ _id: req.body.id })
    if (findMenu.isBlocked === 1) {//if its already blocked make it unblock
        let unblockMenu = await Menu.findByIdAndUpdate({ _id: req.body.id }, { isBlocked: 0 }, { new: true })
        if (unblockMenu) {
            const menuList = await Menu.find({ restaurant_id: req.body.id })
            res.status(200).json({ message: "Success", msg: "Unblocked Successfully", menuList: menuList })
        }
    }
    else { //if its already unblocked make it blocked
        let blockMenu = await Menu.findByIdAndUpdate({ _id: req.body.id }, { isBlocked: 1 }, { new: true })
        if (blockMenu) {
            const menuList = await Menu.find({ restaurant_id: req.body.id })
            res.status(200).json({ message: "Success", msg: "Blocked Successfully", menuList: menuList })
        }
    }
}

exports.deleteMenu = async (req, res) => {
    const id = req.params.id
    try {
        await Menu.findByIdAndDelete(id)
        res.status(200).json({ message: 'Delete Success' })

    } catch (error) {
        res.status(400).json({ message: 'Something went wrong' })
    }
}
