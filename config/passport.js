const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // Try to find by googleId first
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if email already exists (user registered with email/password before)
          const email = profile.emails?.[0]?.value;
          user = await User.findOne({ email });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos?.[0]?.value;
            await user.save();
          } else {
            // Create brand-new Google user (no password)
            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Minimal serialize (we use JWT – no persistent sessions needed)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
