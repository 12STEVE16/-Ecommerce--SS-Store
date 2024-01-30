// app.js
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import MongoStore from 'connect-mongo'
import  authRouter from './Routes/authRoutes.js'
import  adminRoutes from './Routes/adminRoutes.js'
import { setupPassport } from './middleware/passport.js';
import shopRoutes from './Routes/shopRoutes.js';
import * as errorController from './controller/error.js';
import flash from 'connect-flash';

dotenv.config();

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session(
    {secret: 'keyboard cat', 
    resave: false, 
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DB_CONNECTION_STRING })
   }));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash())
mongoose.connect(process.env.DB_CONNECTION_STRING, {
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

  
  setupPassport();
// Routes

app.use(authRouter);

app.use(shopRoutes);

app.use("/admin",adminRoutes)

app.use(errorController.get404);

app.listen(3000, () => {
  console.log('Server started on port 3000.');
});
