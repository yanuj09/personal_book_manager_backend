const express = require('express');
const bookRouter = express.Router();


bookRouter.post('/books/add' , (req, res) => {
    // Handle adding a new book logic here
    res.send('Add a new book endpoint');
});

bookRouter.get('/books/view/:id' , (req, res) => {
    // Handle fetching a specific book by ID logic here
    const bookId = req.params.id;
    res.send(`Fetch book with ID: ${bookId}`);
});

// search for a book by title or author or other book related info

bookRouter.get('/books/search' , (req, res) => {
    // Handle searching for books logic here
    const { title, author } = req.query;
    res.send(`Search books with title: ${title} and author: ${author}`);
})


// edit book info or update book status
bookRouter.patch('/books/edit/:id' , (req, res) => {
    // Handle editing a specific book by ID logic here
    const bookId = req.params.id;
    res.send(`Edit book with ID: ${bookId}`);
});

bookRouter.delete ('/books/delete/:id' , (req, res) => {
    // Handle deleting a specific book by ID logic here
    const bookId = req.params.id;
    res.send(`Delete book with ID: ${bookId}`);
});

bookRouter.get('/books' , (req, res) => {
    // Handle fetching all books logic here
    res.send('Fetch all books collection');
});


module.exports = bookRouter;