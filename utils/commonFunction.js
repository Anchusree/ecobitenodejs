const { Expo } = require('expo-server-sdk');
const User = require('../models/userModel');
const expo = new Expo();

// let serverkey = process.env.NOTIFICATION_SERVER_KEY || 'AAAA826DtRc:APA91bGJU4MB7VRT8DPZIikHKn_2H3tko5SwEgV1kSWGJVM-HnXbaHi3ydd7wGMFzZ7e-7Io3zeX9h3Az826Z-0Zzi2V8D3G0W0dGmPrMPbZWrLbkpHu7Tfw_mdyUFThd7clYE6jBpia'

const generateRandomString = ()=>{
    let text = ""
    let possible = "abcdefghijklmnopqrstuvwxyz0123456789"
    for(var i=0;i<8;i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

const createReserveCode = () => {
    const code = generateRandomString();
    const expiredTime = Date.now() + (60 * 60 * 1000); // Current time + 1 hour in milliseconds

    const reserveCode = {
        code: code,
        expiredTime: new Date(expiredTime)
    }

    return reserveCode
};

const sendNotify=(userId,message)=>{

}
// Function to send notification to a specific user
const sendPushNotification = async(userId, title, body, expoPushToken)=>{
    try {
      // Retrieve the Expo push token for the user from the database
      const user = await User.findById(userId); // Replace 'User' with your User model
      //const expoPushToken = expoPushToken
  
      if (Expo.isExpoPushToken(expoPushToken)) {
        // Construct the notification message
        const message = {
          to: expoPushToken,
          sound: 'default',
          title: title,
          body: body,
        };
  
        // Send the notification using Expo's sendPushNotificationsAsync function
        const receipts = await expo.sendPushNotificationsAsync([message]);
        console.log('Notification sent:', receipts);
      } else {
        console.error('Invalid Expo push token');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

// Function to convert UTC time to Qatar time
function convertUTCToQatarTime(operateHour) {
  // Create a new Date object from the UTC time string
  let utcDate = new Date(operateHour);

  // Get the UTC hours and add 3 hours for Qatar timezone
  let qatarHours = utcDate.getUTCHours() + 3;

  // If the calculated hours are greater than or equal to 24, subtract 24 to get the correct hour in 24-hour format
  if (qatarHours >= 24) {
      qatarHours -= 24;
  }

  // Convert the hours to AM/PM format
  let qatarAMPM = qatarHours >= 12 ? 'PM' : 'AM';
  // Convert 24-hour format to 12-hour format
  qatarHours = (qatarHours % 12) || 12;

  // Get the minutes and seconds from the UTC time
  let minutes = utcDate.getUTCMinutes();
  let seconds = utcDate.getUTCSeconds();

  // Format the time string
  let qatarTime = `${qatarHours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds} ${qatarAMPM}`;

  return qatarTime;
}



const checkStatus = (rest)=>{

  const currentDateTime =  convertUTCToQatarTime(new Date())
  const openTime = convertUTCToQatarTime(rest.open_close_time.from)
  const closeTime = convertUTCToQatarTime(rest.open_close_time.to)

  const dataOutput = `Current Time: ${currentDateTime}; Open Time: ${openTime}; Close Time: ${closeTime}`;

  // Extract open and close time strings
  const openTimeIndex = dataOutput.indexOf("Open Time: ");
  const closeTimeIndex = dataOutput.indexOf("Close Time: ");
  const openTimeSubstring = dataOutput.substring(openTimeIndex + 11, closeTimeIndex); // Extract substring between "Open Time: " and "Close Time: "
  const closeTimeSubstring = dataOutput.substring(closeTimeIndex + 12); // Extract substring starting from "Close Time: "
  
  // Split the open and close time strings
  const openTimeParts = openTimeSubstring.split(":");
  const closeTimeParts = closeTimeSubstring.split(" ")[0].split(":");
  
  // Extract hours and minutes
  const openHour = parseInt(openTimeParts[0]);
  const openMinute = parseInt(openTimeParts[1]);
  let closeHour = parseInt(closeTimeParts[0]);
  const closeMinute = parseInt(closeTimeParts[1]);
  
  // Get AM/PM indicator for close time
  const isPM = closeTimeSubstring.includes("PM");
  
  // Adjust close hour if it's PM and not 12 PM
  if (isPM && closeHour !== 12) {
      closeHour += 12;
  }
  
  // Create Date objects for current, open, and close times
  const currentTime = new Date();
  const openTimeObj = new Date();
  openTimeObj.setHours(openHour, openMinute, 0);
  const closeTimeObj = new Date();
  closeTimeObj.setHours(closeHour, closeMinute, 0);
  
  // Check if the current time is between open and close times
  if (currentTime >= openTimeObj && currentTime <= closeTimeObj) {
     //setCurrentStatus("Open")
     console.log("opened")
     return true
  } else {
    console.log("close")
    false
    //setCurrentStatus("Closed")
  }
}


module.exports = {generateRandomString,createReserveCode,sendPushNotification,convertUTCToQatarTime,checkStatus}

