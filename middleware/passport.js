import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import FacebookStrategy from 'passport-facebook';
import User from '../model/User.js';
import dotenv from 'dotenv';
export const setupPassport = () => {
    passport.use(User.createStrategy());
  
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
  
    passport.deserializeUser((id, done) => {
        // console.log("Deserializing user with id:", id);
        User.findById(id)
          .then((user) => {
            // console.log("Deserialized user:", user);
            done(null, user);
          })
          .catch((err) => {
            // console.error("Error deserializing user:", err);
            done(err);
          });
      });
    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',
      }, async (accessToken, refreshToken, profile, cb) => {
          try {
            // console.log(profile)
              const user = await User.findOne({ googleId: profile.id });
              if (!user) {
                  const newUser = new User({
                      firstName: profile.name.givenName,
                      lastName: profile.name.familyName,
                      username: profile.emails[0].value,
                      googleId: profile.id,
                  });
      
                  await newUser.save();
                  return cb(null, newUser);
              } else {
                  return cb(null, user);
              }
          } catch (err) {
              console.error("Google Authentication Error:", err);
              return cb(err, null);
          }
    }));

    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails'],
      },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const user = await User.findOne({ facebookId: profile.id });
      
                if (!user) {
                  function getFirstName(fullName) {
                    // Logic to extract the first name from the full name
                    return fullName.split(' ')[0];
                }
                
                function getSecondName(fullName) {
                    // Logic to extract the second name from the full name
                    const nameParts = fullName.split(' ');
                    return nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
                }
                
                    const newUser = new User({
                      firstName: getFirstName(profile.displayName),
                      lastName: getSecondName(profile.displayName),
                      username: profile.emails[0].value,
                        facebookId: profile.id,
                    });
      
                    await newUser.save();
                    return cb(null, newUser);
                } else {
                    return cb(null, user);
                }
            } catch (err) {
                return cb(err, null);
            }
        }
      ));  
    
};


export const getGoogleLogin = () => {
    return passport.authenticate('google', {
      scope: ['profile', 'email'],
    });
  };
  
  export const getGoogleCallback = passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/account',
  });

  export const getFacebookLogin = (req, res, next) => {
    passport.authenticate('facebook', {
        scope: ['email'],
    })(req, res, next);
  };
  
  export const getFacebookCallback = passport.authenticate('facebook', {
    failureRedirect: '/login',
    successRedirect: '/account',
  });
    