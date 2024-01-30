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
  is_admin: {
     type: Boolean,
     default: false,
    },
  googleId: String,
  facebookId: String,
});

userSchema.plugin(passportLocalMongoose,);
userSchema.plugin(findOrCreate);

const User = mongoose.model('Admin', userSchema);

export default User;
