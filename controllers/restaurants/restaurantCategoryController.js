const Category = require("../../models/categoryModel")
const Menu = require("../../models/menuModel");
const Order = require("../../models/orderModel");
const Payment = require("../../models/paymentModel");
const Restaurant = require("../../models/restaurantModel");


exports.getCategory = async (req,res)=>{
    try {
        const id = req.params.id;
        const categoryList = await Category.find({ restaurant_id: id });
        return res.status(200).json({
            message: "Success",
            results: categoryList
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.addCategory = async (req,res)=>{
    try {
        let {categoryName, restaurant_id} = req.body
        //console.log(req.body,"bdy")
        if(!categoryName || !restaurant_id){
            return res.status(400).json({message:"Please fill all the fields"})
        }
        // Check if the category name already exists for the given restaurant ID
        const existingCategory = await Category.findOne({ restaurant_id: restaurant_id, category_name: categoryName });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const _category = new Category({
            category_name:categoryName,
            restaurant_id
        })
        _category.save()
        if(_category){
            const categoryList = await Category.find({ restaurant_id});
            return res.status(201).json({
                message:"Success",
                results: categoryList
            })
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.editCategory = async(req,res)=>{
    console.log("bck");
    let {categoryName, restaurant_id,categoryId} = req.body
    console.log(req.body,"bdy");
    
    let findCategoryUpdate = await Category.findByIdAndUpdate(categoryId,{
        category_name:categoryName,
        restaurant_id,

    },{new:true})
    if(findCategoryUpdate){
        const categoryList = await Category.find({ restaurant_id });

        res.status(200).json({message:'Success',result: categoryList})
    }
    else{
        res.status(400).json({message:'Update failed'})
    }
}

exports.deleteCategory = async(req,res) => {

    const  categoryId  = req.params.id
    //console.log(categoryId)

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Remove the association between the category and the menus
    const menu = await Menu.updateMany({ category_id: categoryId }, { category_id: null });
    if (menu.modifiedCount === 0) {
      // If there are no menus associated with the category, it's safe to delete it
      await category.deleteOne();
    }

    return res.status(200).json({ message: 'Success' });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.restDashboard=async(req,res)=>{

    const restaurant_id = req.params.id
    const menuCount = await Menu.countDocuments({ restaurant_id:restaurant_id })
    const orderCount = await Order.countDocuments({restaurant_id:restaurant_id})
    const rest = await Restaurant.find({"_id":restaurant_id})
    const ratingCount = rest && rest[0].rating.length
    //const totalEarnings = rest && rest[0].total_earnings

    const totalEarnings =  await Payment.find({"paymemnt_status":"Completed"})
    .populate('order_id','restaurant_id')

    const getTotalAmount = totalEarnings.reduce((total, payment) => {
        return total + payment.payment_amount;
    }, 0);



    
    
    res.status(200).json({
        message:"Success",
        menuCount,
        orderCount,
        ratingCount,
        totalEarnings:getTotalAmount

    })
}