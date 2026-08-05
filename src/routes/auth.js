const express = require('express');
const authRouter = express.Router();

authRouter.post('/signup', (req, res) => {
    // Handle user signup logic here
    res.send('User signup endpoint');
});

authRouter.post('/login' , (req,res) => {
    // Handle user login logic here
    res.send('User login endpoint');
});

authRouter.post('/logout' , (req,res) => {
    // Handle user logout logic here
    res.send('User logout endpoint');
});


module.exports = authRouter;