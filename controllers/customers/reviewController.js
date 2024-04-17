const Menu = require("../../models/menuModel");
const RatingReview = require("../../models/rating&reviewModel");
const Restaurant = require("../../models/restaurantModel");


exports.writeReviews = async (req, res) => {
    const { rating, review, userId,restaurantId } = req.body;
    console.log(rating, review, userId,restaurantId ,"rating, review, userId,restaurantId ")

    if (!userId || !rating || !review) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const newReview = new RatingReview({
        user_id: userId,
        rating: rating,
        review: review
    })

    newReview.save()
    if(newReview){
       const updateRestaurant = await Restaurant.findOneAndUpdate({_id:restaurantId}, {
            "$push": {
                "rating": newReview
            }
        })
        if(updateRestaurant){
            let reviews = await Restaurant.find({"_id":restaurantId})
            .select('_id restaurantName rating')
            .populate({
                path: 'rating',
                populate: {
                    path: 'user_id',
                    select: 'name email profileImage username' // Select only the necessary fields of the user
                }
            })

            res.status(201).json({ message: "Success", msg:"Review added successfully", reviews: reviews });
        }
       
    }
    else{
        res.status(400).json({ error: "Something went wrong" });
    }

};

exports.getReviews = async(req, res) => {
    try {
        const id = req.params.id
    
        let reviews = await Restaurant.findOne({_id:id})
        .select('_id restaurantName')
        .populate({
            path: 'rating',
            populate: {
                path: 'user_id',
                select: 'name email profileImage username' // Select only the necessary fields of the user
            }
        })
    
        res.status(200).json({ message:"Success",reviews: reviews })
        
    } catch (error) {
        console.log(error.message)
        
        res.status(400).json({ message:"Error" })
       
    }
};