const express = require('express');
const profileRouter = express.Router();
const bcrypt = require('bcrypt');
const { userAuth } = require('../middleswares/authMiddleware');
const { validateProfileUpdateData, validatePasswordUpdateData } = require('../utils/validation');

profileRouter.get('/' , userAuth, async (req, res) => {
        res.status(200).json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                createdAt: req.user.createdAt,
            },
        });
});

profileRouter.patch('/' , userAuth, async (req,res) => {
        try {
            validateProfileUpdateData(req.body);

            const { name, email } = req.body;
            if (typeof name !== 'undefined') {
                req.user.name = name.trim();
            }

            if (typeof email !== 'undefined') {
                const normalizedEmail = email.toLowerCase().trim();
                const existingUser = await req.user.constructor.findOne({ email: normalizedEmail });
                if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
                    res.status(409).json({ message: 'Email is already in use' });
                    return;
                }
                req.user.email = normalizedEmail;
            }

            const updatedUser = await req.user.save();
            res.status(200).json({
                message: 'Profile updated successfully',
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                },
            });
        } catch (err) {
            res.status(400).json({ message: err.message || 'Failed to update profile' });
        }
});

profileRouter.patch('/password', userAuth, async (req, res) => {
    try {
        validatePasswordUpdateData(req.body);

        const { currentPassword, newPassword } = req.body;
        const isCurrentPasswordCorrect = await req.user.validatePassword(currentPassword);
        if (!isCurrentPasswordCorrect) {
            res.status(401).json({ message: 'Current password is incorrect' });
            return;
        }

        req.user.password = await bcrypt.hash(newPassword, 10);
        await req.user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message || 'Failed to update password' });
    }
});

module.exports = profileRouter;