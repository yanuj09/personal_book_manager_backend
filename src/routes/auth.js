const express = require("express");
const authRouter = express.Router();
const uploadImage = require("../middleswares/imageUpload");
const bcrypt = require("bcrypt");
const User = require("../models/user");

authRouter.post(
  "/signup",
  uploadImage.single("profileImage"),
  async (req, res) => {
    try {
      const { firstName, lastName, dob, email, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        firstName,
        lastName,
        dob,
        email,
        password: hashedPassword,
        profileImage: req.file ? req.file.buffer : null,
      });

      const savedUser = await newUser.save();
      const token = await savedUser.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });

      res
        .status(201)
        .json({ message: "User registered successfully", user: savedUser });
    } catch (err) {
      res.status(500).send("Error occurred during signup");
    }
  },
);

authRouter.post("/login", (req, res) => {
  // Handle user login logic here
  res.send("User login endpoint");
});

authRouter.post("/logout", (req, res) => {
  // Handle user logout logic here
  res.send("User logout endpoint");
});

module.exports = authRouter;
