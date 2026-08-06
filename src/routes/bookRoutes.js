const express = require('express');
const {
  listBooks,
  getBook,
  createBook,
  updateBook,
  updateStatus,
  deleteBook,
  listTags,
} = require('../controllers/bookController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Every book route is private, so the guard is applied once here rather than
// being repeated (and eventually forgotten) on each handler.
router.use(requireAuth);

// Declared before '/:id' so 'tags' isn't captured as a book id.
router.get('/tags', listTags);

router.route('/').get(listBooks).post(createBook);
router.route('/:id').get(getBook).patch(updateBook).delete(deleteBook);
router.patch('/:id/status', updateStatus);

module.exports = router;
