const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const User = require('../models/userModel');

passport.use(new GoogleTokenStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    accessType: 'offline',
    prompt: 'consent'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
            return done(null, user);
        }
        
        const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0].value,
            role: 'user',
            userID: await User.countDocuments() + 1
        });
        return done(null, newUser);
    } catch (error) {
        return done(error, null);
    }
}));

module.exports = passport;