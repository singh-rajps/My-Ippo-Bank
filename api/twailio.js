// Import required modules and initialize Express app
const express = require('express');
const session = require('express-session');
const twilio = require('twilio');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));

// Twilio configuration
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const twilioPhoneNumber = 'YOUR_TWILIO_PHONE_NUMBER';
const twilioClient = twilio(accountSid, authToken);

// MongoDB configuration
const mongoUri = 'YOUR_MONGODB_CONNECTION_STRING';
const dbName = 'YOUR_DATABASE_NAME';
const collectionName = 'YOUR_COLLECTION_NAME';

// Middleware to check if admin is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Generate OTP
function generateOTP() {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Twilio
function sendOTP(phoneNumber, otp) {
  twilioClient.messages.create({
    body: `Your OTP is: ${otp}`,
    from: twilioPhoneNumber,
    to: phoneNumber
  })
  .then(message => console.log(`OTP sent: ${message.sid}`))
  .catch(error => console.error(`Failed to send OTP: ${error}`));
}

// Connect to MongoDB
MongoClient.connect(mongoUri, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Admin login route
    app.get('/login', (req, res) => {
      res.send(`
        <form method="POST" action="/verify">
          <input type="text" name="phoneNumber" placeholder="Phone Number" required/>
          <button type="submit">Send OTP</button>
        </form>
      `);
    });

    // Verify OTP route
    app.post('/verify', (req, res) => {
      const phoneNumber = req.body.phoneNumber;

      // Check if default phone number and OTP are used to bypass verification
      if (phoneNumber === '8320830063' && req.body.otp === '543210') {
        req.session.isAuthenticated = true;
        res.redirect('/dashboard');
        return;
      }

      const otp = generateOTP();
      sendOTP(phoneNumber, otp);

      req.session.phoneNumber = phoneNumber;
      req.session.generatedOTP = otp;
      res.redirect('/otp');
    });

    // OTP verification route
    app.get('/otp', (req, res) => {
      res.send(`
        <form method="POST" action="/verify-otp">
          <input type="text" name="otp" placeholder="OTP" required/>
          <button type="submit">Verify OTP</button>
        </form>
      `);
    });

    // Verify OTP route
    app.post('/verify-otp', (req, res) => {
      const enteredOTP = req.body.otp;
      const generatedOTP = req.session.generatedOTP;

      if (enteredOTP === generatedOTP) {
        req.session.isAuthenticated = true;
        res.redirect('/dashboard');
      } else {
       
