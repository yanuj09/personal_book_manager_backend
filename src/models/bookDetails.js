const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    id: {
      type: objectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
    },
    genre: {
      type: String,
    },
    info: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Book" , bookSchema);
