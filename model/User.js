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
  mobile:{
      type:Number,
  },
  address:{
    addressLine1: {
        type: String
    },
    addressLine2: {
        type: String
    },
    suburb: {     
        type: String
    },
    city: {        
        type: String
    },
    state: {
        type: String
    },
    postcode: {    
        type: String
    }
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
  isLocalAccount: {
    type: Boolean,
    default: false,
  },
  cart: {
    type: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
        },
      }
    ],
    default: [],
  },

});

// Middleware to set isLocalAccount
userSchema.pre('save', function (next) {
  if (this.googleId || this.facebookId) {
    this.isLocalAccount = false;
  } else {
    this.isLocalAccount = true;
  }
  next();
});


userSchema.plugin(passportLocalMongoose,);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

export default User;
