// authController.js
import passport from 'passport';
import User from '../model/User.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
      user: 'stevesunny99@gmail.com',
      pass: process.env.USER_PASSWORD,
  }
});

export const sendOTP = async (req, res) => {
  const { email } = req.body;

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
   // const user = new User(email, otp);
    req.session.sampleOtp = otp;
    // Configure the email content
    const mailOptions = {
      from: 'stevesunny99@gmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is: ${otp}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'OTP sent successfully'});
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};


export const renderLogin = (req, res) => {
  const errorMessage = req.flash('error')[0] || null;

  // Log the flash messages
   res.render('auth/page-account-login',{ user: req.user, errorMessage });
};

export const renderRegister = (req, res) => {
  res.render('auth/page-account-register');
};

export const registerUser = (req, res) => {
    console.log(req.body)
    console.log(req.session.sampleOtp)
    if(req.body.otp===req.session.sampleOtp){ 
      User.register(
      { username: req.body.username, firstName:req.body.firstName, lastName: req.body.secondName },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.render("auth/page-account-register", { registerMessage: err.message  });
        } else {
          passport.authenticate('local')(req, res, () => {
            // res.render('shop/account',{user:user});
          });
        }
      }
    );}
    else{
      
          res.render("auth/page-account-register", { registerMessage:'OTP Do Not Match' });
    }
 
};

// export const loginUser = (req, res) => {
//   console.log(req.body)
//   const user = new User({
//     username: req.body.username,
//     password: req.body.password,
//   });
//   console.log(user)
//   req.login(user, (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       passport.authenticate('local')(req, res, () => {
//         console.log('hello',req.user)
//         // res.render('shop/account',{user:user});
//       });
//     }
//   });
// };

export const login = passport.authenticate('local', {
  successRedirect: '/account',
  failureRedirect: '/login',
  failureFlash: 'Invalid credentials',
});
