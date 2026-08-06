const { Book, BOOK_STATUSES } = require('../models/Book');
const ApiError = require('../utils/ApiError');

// Only these fields can ever be written by a client. `owner` and `completedAt`
// are set by the server, which is what stops one reader writing into another's
// shelf by putting an `owner` in the request body.
const WRITABLE_FIELDS = ['title', 'author', 'tags', 'status', 'notes'];

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  title: { title: 1 },
  author: { author: 1 },
  recent: { updatedAt: -1 },
};

function pickWritable(body = {}) {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => WRITABLE_FIELDS.includes(key))
  );
}

// User input goes into a $regex, so metacharacters have to be neutralised or a
// search for "c++" becomes an invalid pattern (and a slow one).
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Turns ?status=&tag=&search= into a Mongo filter that is always scoped to the
// signed-in reader.
function buildFilter(userId, query) {
  const filter = { owner: userId };

  if (query.status) {
    const statuses = String(query.status).split(',').map((s) => s.trim()).filter(Boolean);
    const invalid = statuses.filter((s) => !BOOK_STATUSES.includes(s));
    if (invalid.length) {
      throw ApiError.badRequest(
        `Unknown status: ${invalid.join(', ')}. Expected one of ${BOOK_STATUSES.join(', ')}.`
      );
    }
    filter.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
  }

  if (query.tag) {
    // Tags are stored normalised, so the incoming filter is normalised the same way.
    const tags = String(query.tag).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (tags.length) filter.tags = { $all: tags };
  }

  if (query.search) {
    const term = escapeRegex(String(query.search).trim());
    if (term) {
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { author: { $regex: term, $options: 'i' } },
      ];
    }
  }

  return filter;
}

// GET /api/books — the collection, filtered, sorted and paged.
async function listBooks(req, res) {
  const filter = buildFilter(req.user._id, req.query);
  const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest;

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const [books, total] = await Promise.all([
    Book.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Book.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { books },
    meta: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) },
  });
}

// GET /api/books/:id
async function getBook(req, res) {
  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book) throw ApiError.notFound('Book not found in your collection');

  res.json({ success: true, data: { book } });
}

// POST /api/books
async function createBook(req, res) {
  const book = await Book.create({ ...pickWritable(req.body), owner: req.user._id });

  res.status(201).json({ success: true, message: `'${book.title}' added to your shelf.`, data: { book } });
}

// PATCH /api/books/:id — partial update; only the keys sent are touched.
async function updateBook(req, res) {
  const updates = pickWritable(req.body);
  if (!Object.keys(updates).length) {
    throw ApiError.badRequest(`Nothing to update. Editable fields: ${WRITABLE_FIELDS.join(', ')}.`);
  }

  // Fetched-then-saved rather than findOneAndUpdate so the schema's setters and
  // the completedAt hook run exactly as they do on create.
  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book) throw ApiError.notFound('Book not found in your collection');

  Object.assign(book, updates);
  await book.save();

  res.json({ success: true, message: 'Book updated.', data: { book } });
}

// PATCH /api/books/:id/status — the dashboard's one-tap "mark as reading/completed".
async function updateStatus(req, res) {
  const { status } = req.body || {};
  if (!BOOK_STATUSES.includes(status)) {
    throw ApiError.badRequest(`Status must be one of: ${BOOK_STATUSES.join(', ')}.`);
  }

  const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book) throw ApiError.notFound('Book not found in your collection');

  book.status = status;
  await book.save();

  res.json({ success: true, message: `Marked as ${status.replace(/-/g, ' ')}.`, data: { book } });
}

// DELETE /api/books/:id
async function deleteBook(req, res) {
  const book = await Book.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!book) throw ApiError.notFound('Book not found in your collection');

  res.json({ success: true, message: `'${book.title}' removed from your shelf.`, data: { id: book._id } });
}

// GET /api/books/tags — the reader's own tag vocabulary, with counts, so the
// filter UI can offer real options instead of a free-text box.
async function listTags(req, res) {
  const tags = await Book.aggregate([
    { $match: { owner: req.user._id } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $project: { _id: 0, tag: '$_id', count: 1 } },
  ]);

  res.json({ success: true, data: { tags } });
}

module.exports = {
  listBooks,
  getBook,
  createBook,
  updateBook,
  updateStatus,
  deleteBook,
  listTags,
};
