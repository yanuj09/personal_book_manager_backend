const express = require('express');
const profileRouter = express.Router();

profileRouter.get('/profile/view' , (req, res) => {
    // Handle user profile logic here
    res.send('User profile endpoint');
});

profileRouter.patch('/profile/update' , (req,res) => {
    // Handle user profile update logic here
    res.send('User profile update endpoint');
});

module.exports = profileRouter;