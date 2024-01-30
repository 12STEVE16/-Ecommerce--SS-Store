// User.js
import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import findOrCreate from 'mongoose-findorcreate';

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: {
      type: String,
      required: true,
      },
  lastName: {
    type: String,
    required: true,
    }, 
  status:{
      type:Boolean,
      default:true
  },
  is_admin: {
     type: Boolean,
     default: false,
    },
  createdOn: {
      type: Date,
      default: Date.now, // Set a default value
      required: true,
    },
  updatedOn: {
      type: Date,
      default: Date.now, // Set a default value
      required: true,
    },
  googleId: String,
  facebookId: String,
});


userSchema.plugin(passportLocalMongoose,);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

export default User;
