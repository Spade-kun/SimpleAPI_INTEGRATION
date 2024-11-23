const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./config/db");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

require("dotenv").config();
require("./config/passport");
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
app.use(express.json());

// Initialize session and passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB();

// Middleware to verify JWT
const jwtVerifyMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    }
    req.user = decoded; // Attach decoded user info to request
    next();
  });
};

// Google authentication routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect based on role
    if (req.user.role === "admin") {
      res.redirect("/admin");
    } else if (req.user.role === "user") {
      res.redirect("/user");
    } else {
      res.redirect("/login"); // Or handle unknown roles
    }
  }
);

// Route to check the logged-in user's role
app.get("/user", jwtVerifyMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get("/admin", jwtVerifyMiddleware, (req, res) => {
  if (req.user.role === "admin") {
    res.json({ message: "Welcome to the Admin Dashboard" });
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
});

app.post("/login/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Generate access token (1 hour expiration)
    const sessionToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Generate refresh token (7 days expiration)
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      user: { name: user.name, email: user.email, role: user.role, picture: user.picture },
      token: sessionToken,
      refreshToken: refreshToken,
    });
    console.log("User found:", user);
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

// Add new endpoint to refresh the token
app.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new access token
    const newSessionToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token: newSessionToken,
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Use the user routes
app.use("/users", userRoutes);
app.use("/documents", documentRoutes);

// Logout route to clear the session
app.post("/logout", (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out successfully" });
  });
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
