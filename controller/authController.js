// authController.js
import passport from 'passport';
import User from '../model/User.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
      user: process.env.USER_EMAIL,
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
    console.log(req.session.sampleOtp)
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
    if(req.body.Otp==req.session.sampleOtp){ 
      User.register(
      { username: req.body.username, firstName:req.body.firstName, lastName: req.body.secondName },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.render("auth/page-account-register", { registerMessage: err.message  });
        } else {
          passport.authenticate('local')(req, res, () => {
             res.redirect('/');
          });
        }
      }
    );}
    else{
      
          res.render("auth/page-account-register", { registerMessage:'OTP Do Not Match' });
    }
 
};


export const login = passport.authenticate('local', {
  successRedirect: '/account',
  failureRedirect: '/login',
  failureFlash: 'Invalid credentials',
});


// export const updatePassword = async (req, res) => {
//   const { currentPassword, password, confirmPassword, userId } = req.body;

//   if (password !== confirmPassword) {
//       return res.json({ success: false, message: 'New passwords do not match' });
//   }

//   try {
//       const user = await User.findById(userId);
//       if (!user) {
//           return res.status(404).json({ success: false, message: 'User not found' });
//       }

//       user.authenticate(currentPassword, (err, user, passwordError) => {
//           if (passwordError) {
//               return res.json({ success: false, message: 'Current password is incorrect' });
//           }

//           if (err) {
//               return res.status(500).json({ success: false, message: 'Authentication error' });
//           }

//           user.setPassword(password, async (err) => {
//               if (err) {
//                   console.error('Error setting new password:', err);
//                   return res.status(500).json({ success: false, message: 'Failed to update password' });
//               }

//               await user.save();
//               res.json({ success: true, message: 'Password updated successfully' });
//           });
//       });

//   } catch (error) {
//       console.error('Error updating password:', error);
//       res.status(500).json({ success: false, message: 'Failed to update password' });
//   }
// };
export const updatePassword = async (req, res) => {
  const { currentPassword, password, confirmPassword, userId } = req.body;

  if (!currentPassword || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
  }

  if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  try {
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (!user.isLocalAccount) {
          return res.status(400).json({ success: false, message: 'Cannot change password for OAuth accounts' });
      }

      user.authenticate(currentPassword, async (err, thisModel, passwordError) => {
          if (passwordError) {
              return res.status(400).json({ success: false, message: 'Current password is incorrect' });
          }

          user.setPassword(password, async (err) => {
              if (err) {
                  return res.status(500).json({ success: false, message: 'Failed to update password' });
              }

              await user.save();
              res.json({ success: true, message: 'Password updated successfully' });
          });
      });

  } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};