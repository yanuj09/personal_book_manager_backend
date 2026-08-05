const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    DOB: {
      type: Date,
      required: true,
    },
    email: {
      type: string,
      required: true,
      unique: true,
    },
    password: {
      type: password,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
