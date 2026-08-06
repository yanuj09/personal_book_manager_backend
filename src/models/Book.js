const mongoose = require('mongoose');

// The three reading states from the spec. Exported so validation, filters and
// the dashboard all read from one source of truth.
const BOOK_STATUSES = ['want-to-read', 'reading', 'completed'];

const bookSchema = new mongoose.Schema(
  {
    // Every book belongs to exactly one reader; this is the ownership boundary
    // that all queries filter on.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must be at most 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [120, 'Author must be at most 120 characters'],
    },
    tags: {
      type: [String],
      default: [],
      // Tags are free-form, so they are normalised (trimmed, lower-cased,
      // de-duplicated) before they ever reach the database.
      set: (tags) => {
        if (!Array.isArray(tags)) return [];
        const cleaned = tags
          .filter((tag) => typeof tag === 'string')
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 10);
        return [...new Set(cleaned)];
      },
      validate: {
        validator: (tags) => tags.every((tag) => tag.length <= 24),
        message: 'Each tag must be at most 24 characters',
      },
    },
    status: {
      type: String,
      enum: { values: BOOK_STATUSES, message: '`{VALUE}` is not a valid status' },
      default: 'want-to-read',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes must be at most 2000 characters'],
      default: '',
    },
    // Stamped automatically when a book moves into `completed` (see pre-save).
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// The common read: "my books, newest first", optionally narrowed by status.
bookSchema.index({ owner: 1, status: 1, createdAt: -1 });
// Backs the tag filter without scanning the whole collection.
bookSchema.index({ owner: 1, tags: 1 });

// One reader shouldn't hold the same title by the same author twice.
bookSchema.index(
  { owner: 1, title: 1, author: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

// `completedAt` is derived from `status` so callers can never send the two out
// of sync — finishing a book stamps it, un-finishing it clears the stamp.
bookSchema.pre('save', function syncCompletedAt(next) {
  if (this.isModified('status')) {
    this.completedAt = this.status === 'completed' ? this.completedAt || new Date() : null;
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = { Book, BOOK_STATUSES };
