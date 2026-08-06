const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decodedToken.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = {userAuth};