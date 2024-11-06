const passport = require('passport');
const jwt = require('jsonwebtoken');

// Middleware to authenticate with Google token and issue JWT
const authMiddleware = (req, res, next) => {
    passport.authenticate('google-token', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Unauthorized: Invalid Google token' });
        }

        // Generate a JWT with user ID and role
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Attach token to response and proceed
        req.user = user;
        req.token = token;
        next();
    })(req, res, next);
};

// Middleware to verify JWT on protected routes
const jwtVerifyMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
        }

        req.user = decoded; // Attach decoded user info to request
        next();
    });
};

module.exports = { authMiddleware, jwtVerifyMiddleware };
