const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const randomstring = require('randomstring');

const app = express();
const port = 3000;

// MySQL configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Amigos@123',
  database: 'pushprajdb1',
  insecureAuth : true
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Generate OTP and store it in the database
app.post('/generate-otp', (req, res) => {
  const phoneNumber = req.body.phone_number;
  const otp = randomstring.generate({
    length: 6,
    charset: 'numeric',
  });

  // Store OTP in the database
  const sql = 'INSERT INTO otps (phone_number, otp) VALUES (?, ?)';
  db.query(sql, [phoneNumber, otp], (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to generate OTP' });
    } else {
      // Send OTP to the user via SMS or any other method
      console.log('OTP:', otp);
      res.status(200).json({ message: 'OTP generated successfully' });
    }
  });
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
  const phoneNumber = req.body.phone_number;
  const otp = req.body.otp;

  // Check if OTP exists in the database
  const sql = 'SELECT * FROM otps WHERE phone_number = ? AND otp = ?';
  db.query(sql, [phoneNumber, otp], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to verify OTP' });
    } else if (results.length === 0) {
      res.status(400).json({ error: 'Invalid OTP' });
    } else {
      // OTP is valid
      // Proceed with login logic or any other actions
      res.status(200).json({ message: 'OTP verified successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
