// authRoutes.js
import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import {islogged,isAlreadyLogged } from'../middleware/auth.js'
import { getGoogleLogin, getGoogleCallback ,getFacebookLogin,getFacebookCallback} from '../middleware/passport.js';
import * as authController from '../controller/authController.js';
const router = express();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.set('view engine', 'ejs');
router.set('views', './views');





router.get('/login',isAlreadyLogged ,authController.renderLogin);

router.post('/send-otp', authController.sendOTP);

router.get('/register',isAlreadyLogged , authController.renderRegister);

router.post('/register', authController.registerUser);

router.get('/auth/google',isAlreadyLogged,getGoogleLogin());

router.get('/auth/google/callback',getGoogleCallback);

router.get('/auth/facebook',getFacebookLogin);

router.get('/auth/facebook/callback',getFacebookCallback);


router.post('/login', authController.login);

router.get('/logout', (req, res) => {
  req.logout((err) => {
  res.redirect('/');
  });
});


export default router;
