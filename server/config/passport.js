const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const User = require('../models/User'); // Adjust the path as needed
require('dotenv').config();
passport.use(new GoogleTokenStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await User.findOne({ email: profile.email });
        if (user) {
            return done(null, user);
        } else {
            const newUser = await User.create({
                name: profile.displayName,
                email: profile.email,
                picture: profile.picture,
                role: 'user' // Set default role
            });
            return done(null, newUser);
        }
    } catch (error) {
        return done(error, null);
    }
}));
