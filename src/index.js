const bodyParser = require('body-parser');
import cors from 'cors';
import express from "express";
// import mongoose from 'mongoose';
import config from '../config';
import * as msgController from './controllers/msgController';

// var multer  = require('multer');

// mongoose.connect( config.DB_URL , {useNewUrlParser: true});
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   console.log('DB CONNECTED!');
// });

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var whitelist = ['http://localhost:4001', 'http://localhost:3500']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}
app.use(cors(corsOptionsDelegate));


// sms apis
// app.get("/getbalance", msgController.getSmsOtpBal);
// app.post("/sendotp", msgController.sendOtp);
// app.post("/verifyotp", msgController.verifyOtp);

// app.get("/balance_psms", msgController.getPromotionalSmsBal);
// app.post("/send_psms", msgController.sendPromotionalSms);


app.post("/generate_otp", msgController.get_otp );
app.post("/resend_otp", msgController.resend_otp);
app.post("/verify_otp", msgController.verify_otp );

app.post("/subscribe", msgController.addSubscriber );
app.post("/unsubscribe", msgController.removeSubscriber );
app.post("/bulk_sms", msgController.sendBulkSms );

const _port = process.env.PORT || config.PORT;
console.log('App is started on port: ', _port)
app.listen(_port);