const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleWare = require('../middlewares/auth.middleware')

router.post('/register',[
    body('fullname.firstname').isLength({min:2}).withMessage('First name must be 2 character long'),
    body('password').isLength({min:6}).withMessage('Username must be at least 3 characters long'),
],
userController.registerUser);

router.post('/login',[
    body('username').isLength({min:3}).withMessage('Username must be at least 3 characters long'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long'),
],
userController.loginUser);

router.get('/profile',authMiddleWare.authUser,userController.getUserProfile);
router.get('/logout',authMiddleWare.authUser,userController.logoutUser);
router.get('/leaderboard',authMiddleWare.authUser,userController.getLeaderboard);

router.post('/complete-level',
    authMiddleWare.authUser,
    [
        body('level').isInt({ min: 1, max: 5 }).withMessage('Level must be between 1 and 5'),
        body('points').optional().isInt({ min: 0 }).withMessage('Points must be a non-negative integer')
    ],
    userController.completeLevel
);

module.exports = router;