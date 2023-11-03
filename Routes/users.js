const express = require('express');
const bcrypt = require('bcrypt');
const Users = require('../models/usersSchema');
const {createToken, validateToken} = require('../jwtAuth');
const transporter = require('../utility/SendEmail');
const crypto = require('crypto');

const router = express.Router();

let sentOTP;
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); 
const iv = crypto.randomBytes(16);  


// Register route.
router.post('/register', async(req, res) => {
    try {
        const {username, email, password, phoneNo } = req.body;

        const existingUser = await Users.findOne({
            $or:[
                { username: username},
                { email: email}
            ]
        });

        if(password === ""){
            return res.status(400).json({message: "Please enter a password"});
        }
        if(existingUser ) {
            return res.status(302).json({message: 'Already registered, please Login'});
        }

        const harshedPassword = await bcrypt.hash(password, 10);

        const newUser = await Users.create({
            username:username,
            email: email,
            password: harshedPassword,
            phoneNo:phoneNo,
        }, );

        if(!newUser){
            return res.status(400).json({status:false, message: "failed to create user"});
        }

        return res.status(201).json({status:true, message: "user created successfully", user: newUser });

        
    } catch (error) {
        return res.status(500).json({status:false, message: error.message});
    }
});

// Login route.
router.post('/login', async (req, res) => {

    const {username, email, password } = req.body;

   try {
        const existingUser = await Users.findOne({
            $or:[
                { username: username},
                { email: email}
            ]
        });

        if(!existingUser || password === ""){
            return  res.status(404).json({status:false, message: 'User not found'});
        }

        const matchpassword = await bcrypt.compare(password, existingUser.password);

        if(!matchpassword){
           return res.status(400).json({status:false, message: 'incorrect user Details, please use the correct user Details'});
        }

        const accessToken = createToken(existingUser);
        return res.status(200).json({status:true, message: 'login successful', existingUser, accessToken:accessToken});
    
   } catch (error) {
    return res.status(500).json({status:false, message: error.message});
   }

});

router.use(validateToken);

// Forgot Password route.
router.post('/forgot-password', async (req, res) => {

    try {
        const { email } = req.body;
        const user = await Users.findOne({ email: email });

        if (!user) {
            return res.status(400).json({status:false, message: 'Email is incorrect' });
        }

      // Generate a 6-digit OTP.
      const generatedOTP = Math.floor(100000 + Math.random() * 900000);

      // Store the OTP in the global variable sentOTP.
      sentOTP = generatedOTP;

        // Encrypt the user's ID using AES.
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const encryptedUserId = Buffer.concat([cipher.update(user._id.toString()), cipher.final()]);

        const mailOptions = {
            to: email,
            subject: 'Password Reset',
            html: `<div>
                <h2>Password Reset</h2>
                <p> <strong>Keep the following details because you will need it for your password reset</strong></p>
                <p>Your OTP is: ${sentOTP}</p>
                <p>Your user ID: ${encryptedUserId.toString('hex')}</p>
            </div>`,
        };

        // Send the email using the transporter
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).send('Error sending email: ' +  error);
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).json({status:true, message: 'Password reset email sent successfully' });
            }
        });
        
    } catch (error) {
        res.status(404).send(error.message);
    }
});


// Reset Password route.
router.patch('/reset-password', async (req, res) => {
    try {
        const { encryptedUserId, OTP, newPassword } = req.body;

        // Check if the OTP matches 
        if(OTP != sentOTP ){
            return res.status(400).json({status:false, message: 'Invalid OTP' });
        }

        // Decrypt the user's ID using AES.
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        const decryptedUserId = Buffer.concat([decipher.update(Buffer.from(encryptedUserId, 'hex')), decipher.final()]);

        const user = await Users.findById(decryptedUserId.toString());

        if (!user) {
            return res.status(400).json({status:false, message: 'Invalid user ID' });
        }

        // Hash the new password before updating the user document.
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({status:true, message: 'Password reset successful' });

    } catch (error) {
        return res.status(500).json({status:false, message: error.message });
    }
});


module.exports = router;