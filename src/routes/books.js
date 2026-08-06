const express = require('express');
const bookRouter = express.Router();
const Book = require('../models/bookDetails');
const { userAuth } = require('../middleswares/authMiddleware');
const {
    validateBookPayload,
    validateBookUpdatePayload,
    normalizeTags,
    normalizeStatus,
} = require('../utils/validation');

bookRouter.use(userAuth);

bookRouter.post('/' , async (req, res) => {
        try {
            validateBookPayload(req.body);
            const tags = normalizeTags(req.body.tags);
            const status = normalizeStatus(req.body.status);

            const book = await Book.create({
                userId: req.user._id,
                title: req.body.title.trim(),
                author: req.body.author.trim(),
                description: req.body.description?.trim() || '',
                notes: req.body.notes?.trim() || '',
                tags,
                status,
                statusHistory: [{ status, changedAt: new Date() }],
            });

            res.status(201).json({ message: 'Book added successfully', book });
        } catch (err) {
            res.status(400).json({ message: err.message || 'Failed to add book' });
        }
});

bookRouter.get('/dashboard' , async (req, res) => {
        try {
            const userId = req.user._id;
            const [
                totalBooks,
                currentlyReading,
                completedBooks,
                books,
            ] = await Promise.all([
                Book.countDocuments({ userId }),
                Book.countDocuments({ userId, status: 'reading' }),
                Book.countDocuments({ userId, status: 'completed' }),
                Book.find({ userId }).sort({ updatedAt: -1 }).limit(12),
            ]);

            res.status(200).json({
                metrics: {
                    totalBooks,
                    currentlyReading,
                    completedBooks,
                },
                books,
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to load dashboard' });
        }
});

bookRouter.get('/' , async (req, res) => {
        try {
            const { status, tag, search, page = 1, limit = 20 } = req.query;
            const parsedPage = Math.max(Number(page) || 1, 1);
            const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

            const query = { userId: req.user._id };
            if (status) {
                query.status = normalizeStatus(status);
            }
            if (tag) {
                query.tags = tag.toString().trim().toLowerCase();
            }
            if (search) {
                const searchRegex = new RegExp(search.toString().trim(), 'i');
                query.$or = [
                    { title: searchRegex },
                    { author: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex },
                ];
            }

            const [books, total] = await Promise.all([
                Book.find(query)
                    .sort({ updatedAt: -1 })
                    .skip((parsedPage - 1) * parsedLimit)
                    .limit(parsedLimit),
                Book.countDocuments(query),
            ]);

            res.status(200).json({
                books,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit),
                },
            });
        } catch (err) {
            res.status(400).json({ message: err.message || 'Failed to fetch books' });
        }
});

bookRouter.get('/:id' , async (req, res) => {
        try {
            const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
            if (!book) {
                res.status(404).json({ message: 'Book not found' });
                return;
            }
            res.status(200).json({ book });
        } catch (err) {
            res.status(400).json({ message: 'Invalid book id' });
        }
});


// Single reusable endpoint for both detail edit and status update.
bookRouter.patch('/:id' , async (req, res) => {
        try {
            validateBookUpdatePayload(req.body);

            const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
            if (!book) {
                res.status(404).json({ message: 'Book not found' });
                return;
            }

            const previousStatus = book.status;
            if (typeof req.body.title !== 'undefined') {
                book.title = req.body.title.trim();
            }
            if (typeof req.body.author !== 'undefined') {
                book.author = req.body.author.trim();
            }
            if (typeof req.body.description !== 'undefined') {
                book.description = req.body.description.trim();
            }
            if (typeof req.body.notes !== 'undefined') {
                book.notes = req.body.notes.trim();
            }
            if (typeof req.body.tags !== 'undefined') {
                book.tags = normalizeTags(req.body.tags);
            }
            if (typeof req.body.status !== 'undefined') {
                book.status = normalizeStatus(req.body.status);
            }

            if (previousStatus !== book.status) {
                book.statusHistory.push({ status: book.status, changedAt: new Date() });
            }

            await book.save();
            res.status(200).json({ message: 'Book updated successfully', book });
        } catch (err) {
            res.status(400).json({ message: err.message || 'Failed to update book' });
        }
});

bookRouter.delete ('/:id' , async (req, res) => {
        try {
            const deletedBook = await Book.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
            if (!deletedBook) {
                res.status(404).json({ message: 'Book not found' });
                return;
            }
            res.status(200).json({ message: 'Book deleted successfully' });
        } catch (err) {
            res.status(400).json({ message: 'Invalid book id' });
        }
});


module.exports = bookRouter;