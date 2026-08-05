const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const userid = decodedToken.userId;

    const user = await User.findById(userid);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Error in userAuth middleware:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {userAuth};