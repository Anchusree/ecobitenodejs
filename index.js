const express = require("express")
const app = express()
const env = require("dotenv")
const cors = require("cors")
const mongoose = require("mongoose")
const cron = require('node-cron');
const customerRouter = require("./routes/customer/customerRoute")
const restaurantRouter = require("./routes/restaurants/restaurantRoute")
const adminRouter = require("./routes/admin/adminRoute")
const { convertUTCToQatarTime, checkStatus } = require("./utils/commonFunction")
const Restaurant = require("./models/restaurantModel")
const port = 8000 || process.env.PORT


env.config()


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//mongodb+srv://root:<password>@cluster0.gbchjb4.mongodb.net/

app.use("/api", customerRouter)
app.use("/api", restaurantRouter)
app.use("/api", adminRouter)

//Home
app.get("/",(req,res)=>{
    res.status(200).send({
        "success":true,"msg":"node server running"
})

// Define the cron job to update restaurant status
cron.schedule('* * * * * *', async () => { // Runs every 1 minutes
    const menuResults = await Restaurant.find({ restaurantStatus: "Accepted", isBlocked: 0 })
        .sort({ total_Ratings: -1 })  // Sort restaurants by total ratings in descending order
        .populate('rating');// Populate the 'rating' field with details from the 'Rating' collection

    let currentTime = new Date()
    for (const restaurant of menuResults) {
        const openTime = new Date(restaurant.open_close_time.from); 
        const closeTime = new Date(restaurant.open_close_time.to);

        // Extract hours and minutes from the current time, open time, and close time
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const openHours = openTime.getHours();
        const openMinutes = openTime.getMinutes();
        const closeHours = closeTime.getHours();
        const closeMinutes = closeTime.getMinutes();

        // Compare only the hours and minutes
        if (
            (currentHours > openHours || (currentHours === openHours && currentMinutes >= openMinutes)) &&
            (currentHours < closeHours || (currentHours === closeHours && currentMinutes < closeMinutes))
        ) {
            // console.log("Restaurant is open:", restaurant.restaurantName);
            await Restaurant.findByIdAndUpdate(restaurant._id, { $set: { open_close_status: "Open" } });
        } else {
            // console.log("Restaurant is closed:", restaurant.restaurantName);
            await Restaurant.findByIdAndUpdate(restaurant._id, { $set: { open_close_status: "Closed" } });
        }
    
    }
  
});


//url not found
app.use((req, res, next) => {
    const error = new Error(`Not Found : ${req.originalUrl}`)
    res.status(404)
    next(error)
})


app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    await mongoose.connect(`${process.env.MONGOURI}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => console.log("Connected to mongodb"))
        .catch((err) => {
            console.log(err)
        })
})



