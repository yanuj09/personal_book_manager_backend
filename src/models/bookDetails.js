const mongoose = require("mongoose");

const allowedStatuses = ["want_to_read", "reading", "completed"];

const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: allowedStatuses,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const bookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: allowedStatuses,
      default: "want_to_read",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    statusHistory: {
      type: [historySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

bookSchema.index({ userId: 1, createdAt: -1 });
bookSchema.index({ userId: 1, status: 1 });
bookSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model("Book" , bookSchema);
