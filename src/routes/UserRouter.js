const express = require("express");
const router = express.Router();
const userController = require('../controllers/UserController');
const { authMiddleWare, authUserMiddleWare } = require("../middleware/AuthMiddleware");

router.post('/sign-up', userController.createUser)
router.post('/sign-in', userController.loginUser)
router.post('/log-out', userController.logoutUser)

router.put('/update-user/:id', authUserMiddleWare, userController.updateUser)
router.delete('/delete-user/:id', authMiddleWare, userController.deleteUser)
router.get('/getAll', authMiddleWare, userController.getAllUser)
router.get('/get-details/:id', authUserMiddleWare, userController.getDetailsUser)
router.post('/refresh-token', userController.refreshToken)
router.post('/delete-many', authMiddleWare, userController.deleteMany)
router.get('/get-total-user', authMiddleWare, userController.getTotalUsers)
router.get('/count-by-day', authMiddleWare, userController.getUserCountByDay)
router.post('/change-password/:id', authUserMiddleWare, userController.changePassword)
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', authMiddleWare, userController.resetPassword);
module.exports = router