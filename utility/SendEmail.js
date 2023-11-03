const nodemailer = require('nodemailer');
require('dotenv').config();


// Create a transporter using the 'nodemailer' library
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:process.env.EMAIL ,
      pass: process.env.GMAILPASSCODE, 
    },
  });



module.exports = transporter;