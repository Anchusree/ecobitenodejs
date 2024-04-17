const Menu = require("../../models/menuModel");
const Restaurant = require("../../models/restaurantModel");
const { convertUTCToQatarTime, checkStatus } = require("../../utils/commonFunction");



exports.getTodaysMenu = async (req, res) => {
    try {
        console.log("gettodaysmnu")
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysMenuList = await Menu.find({ createdAt: { $gte: today } })
            .populate('category_id', 'category_name category_image')
            .populate('restaurant_id', 'restaurantName restaurantImage open_close_time open_close_status total_Ratings rating')
            .populate('restaurant_id.rating');

        const menusByRestaurants = await Promise.all(todaysMenuList.map(async menuItem => {
            //console.log(menuItem.restaurant_id, "menuItem.restaurant_id");
            const restaurant = await Restaurant.findById(menuItem.restaurant_id._id);
            if (restaurant && restaurant.open_close_status === 'Open') {
                return menuItem;
            }
        }));
        
        // Filter out any undefined values from the map operation
        const filteredMenus = menusByRestaurants.filter(menuItem => menuItem !== undefined);
        if (filteredMenus.length > 0) {
            return res.status(200).json({
                message: "Success",
                todaysMenuList: filteredMenus
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

exports.getTopRatedRestaurant = async (req, res) => {

    const menuResults = await Restaurant.find({ restaurantStatus: "Accepted", isBlocked: 0 })
        .sort({ total_Ratings: -1 })  // Sort restaurants by total ratings in descending order
        .populate('rating');// Populate the 'rating' field with details from the 'Rating' collection


    // Calculate average rating for each restaurant
    const updatedResults = menuResults.map(restaurant => {
        const totalRatings = restaurant.rating.length;
        let sumOfRatings = 0;
        restaurant.rating.forEach(rating => {
            sumOfRatings += rating.rating;
        });
        const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;
        return { ...restaurant.toJSON(), averageRating };
    })

    res.status(200).json({ message: 'Success', menuResults: updatedResults });

}

exports.getAllRestMenus = async (req, res) => {

    const restaurantId = req.params.id
    const getRestMenus = await Menu.find({ restaurantStatus: restaurantId })

    res.status(200).json({ message: "Success", results: getRestMenus });

}

exports.getAllRestaurantsAndMenus = async (req, res) => {
    try {
        // Get all Accepted restaurants
        const acceptedRestaurants = await Restaurant.find({ restaurantStatus: 'Accepted', isBlocked: 0 })

        // Get all menus associated with the Accepted restaurants
        const menus = await Menu.find({ restaurant_id: { $in: acceptedRestaurants.map(restaurant => restaurant._id) } })
            .populate('restaurant_id', 'restaurantName restaurantImage open_close_status open_close_time total_Ratings email phone address ')

        // Return the menus
        res.status(200).json({ message: 'Success', results: menus });

    } catch (error) {
        res.status(500).json({ message: error.message }); // Handling errors
    }
}

exports.getAllMenusByRestaurant = async (req, res) => {
    try {
        console.log("menusByrest")
        const id = req.params.id
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Get all Accepted restaurants
        const menus = await Menu.find({ restaurant_id: id, createdAt: { $gte: today } })
            .populate('restaurant_id', 'restaurantName restaurantImage open_close_time open_close_status total_Ratings rating')
            .populate('category_id', 'category_name category_image')


            const menusByRestaurants = await Promise.all(menus.map(async menuItem => {
                //console.log(menuItem.restaurant_id, "menuItem.restaurant_id");
                const restaurant = await Restaurant.findById(menuItem.restaurant_id);
                if (restaurant && restaurant.open_close_status === 'Open') {
                    return menuItem;
                }
            }));
            
            // Filter out any undefined values from the map operation
            const filteredMenus = menusByRestaurants.filter(menuItem => menuItem !== undefined);

        // Return the menus
        res.status(200).json({ message: 'Success', menus: filteredMenus });

    } catch (error) {
        res.status(500).json({ message: error.message }); // Handling errors
    }

}


