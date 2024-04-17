const Payment = require("../../models/paymentModel")


exports.getRestPayments = async(req,res)=>{

    try {
        
        const restaurantId = req.params.id

        const orderpaymeents = await Payment.find({"paymemnt_status":"Completed"})
        .populate('order_id','restaurant_id')
    
        //console.log(orderpaymeents,"orderpaymeents")
    
        const filterresults = orderpaymeents.length > 0 && orderpaymeents.filter((order)=>{
               if( order.order_id.restaurant_id.toString() == restaurantId){
                return true
               }
            }
        )
    
        return res.status(200).json({
            message: "Success",
            restpayments:filterresults.length > 0 ? filterresults : []
        });
    } catch (error) {
        
    }
   



}