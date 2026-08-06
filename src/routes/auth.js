const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignupData, validateLoginData } = require("../utils/validation");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req.body);

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ message: "Email is already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    const token = savedUser.getJWT();

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Signup failed" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    validateLoginData(req.body);

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = user.getJWT();
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Login failed" });
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logout successful" });
});

module.exports = authRouter;
