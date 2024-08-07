const express = require('express')
const routers = express();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const moment = require('moment')
const axios = require('axios')
const fs = require('fs')

routers.use(morgan('dev'))

routers.use(cookieParser())
routers.use(express.urlencoded({extended: false}))
routers.use(express.json())
routers.use(bodyParser.json())

// CONNECTING TO FRONTEND
routers.use(cors({
           origin : 'http://localhost:5173',
           credentials: true
           }))

// ACCESS TOKEN 
async function getAccessToken() {
    const consumer_key = ""; // REPLACE IT WITH YOUR CONSUMER KEY
    const consumer_secret = ""; // REPLACE IT WITH YOUR CONSUMER SECRET
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth =
      "Basic " +
      new Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");
  
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: auth,
        },
      });
     
      const dataresponse = response.data;
      const accessToken = dataresponse.access_token;
      return accessToken;
    } catch (error) {
      throw error;
    }
}

routers.get("/api/access_token", (req, res) => {
    getAccessToken()
      .then((accessToken) => {
        res.json({ message: "Your access token is " + accessToken });
      })
      .catch(console.log);
  });

routers.post('/stkpush', (req, res) => {
    try {

        if(req.body.values.phone.toString().startsWith('0')){
            return res.json("Start with country code:+254*********");
        }

        getAccessToken()
                      .then((accessToken) => {
          const url =
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
          const auth = "Bearer " + accessToken;
          const timestamp = moment().format("YYYYMMDDHHmmss");
          const password = new Buffer.from(
              "174379" +
              "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" +
              timestamp
          ).toString("base64");
          
          const phoneNumber = req.body.values.phone.toString();

          axios.post(url,{
                BusinessShortCode: "174379",
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: req.body.values.amount.toString(), 
                PartyA: phoneNumber, //phone number to receive the stk push
                PartyB: "174379",
                PhoneNumber: phoneNumber,
                CallBackURL: "https://9892-105-27-235-60.ngrok-free.app/api/callback", //Use actual URL or ngrok for MPESA API TO send back response
                AccountReference: 'MPESA DARAJA API STK PUSH TEST',//
                TransactionDesc: "Mpesa Daraja API stk push test",
              },
              {
                headers: {
                  Authorization: auth,
                },
              }
            )
            .then((response) => {
                console.log("SUCCESS TRANSACTION")
              return res.json({
                "ResponseCode" : "0",
                "ResponseDesc" : "success",
                "ResponseMessage" : "Request is successful done ✔✔. Please enter mpesa pin to complete the transaction"
              })
            })
            .catch((error) => {
                return res.json({
                    "ResponseCode" : "1",
                    "ResponseDesc" : "Failed",
                    "ResponseMessage" : "Request is Failed!!",
                    "error": error.message
                  })
            });

                       })
                      .catch((err) => {
                        console.log(err.message)
                        return res.json(err.message)
                       })
       }catch(err){
        return res.json(err.message)
       }
})

routers.post("/api/callback", (req, res) => {
    console.log("STK PUSH CALLBACK");
    const merchantRequestID = req.body.Body.stkCallback.MerchantRequestID;
    const checkoutRequestID = req.body.Body.stkCallback.CheckoutRequestID;
    const resultCode = req.body.Body.stkCallback.ResultCode;
    const resultDesc = req.body.Body.stkCallback.ResultDesc;
    const callbackMetadata = req.body.Body.stkCallback.CallbackMetadata;
    const amount = callbackMetadata.Item[0].Value;
    const mpesaReceiptNumber = callbackMetadata.Item[1].Value;
    const transactionDate = callbackMetadata.Item[3].Value;
    const phoneNumber = callbackMetadata.Item[4].Value;
   /*
    console.log("MerchantRequestID:", merchantRequestID);
    console.log("CheckoutRequestID:", checkoutRequestID);
    console.log("ResultCode:", resultCode);
    console.log("ResultDesc:", resultDesc);
    
    console.log("Amount:", amount);
    console.log("MpesaReceiptNumber:", mpesaReceiptNumber);
    console.log("TransactionDate:", transactionDate); 
    console.log("PhoneNumber:", phoneNumber); 
   */
    var json = JSON.stringify(req.body);
    console.log(req.body)
    fs.writeFile("stkcallback.json", json, "utf8", function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("STK PUSH CALLBACK STORED SUCCESSFULLY");
    });

  });

module.exports = routers;
