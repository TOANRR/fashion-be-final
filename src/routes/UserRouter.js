const express = require("express");
const router = express.Router();
const userController = require('../controllers/UserController');
const { authMiddleWare, authUserMiddleWare } = require("../middleware/AuthMiddleware");

router.post('/sign-up', userController.createUser)
router.post('/sign-in', userController.loginUser)
router.post('/log-out', userController.logoutUser)

router.put('/update-user/:id', userController.updateUser)
router.delete('/delete-user/:id',authMiddleWare, userController.deleteUser)
router.get('/getAll', authMiddleWare, userController.getAllUser)
router.get('/get-details/:id',authUserMiddleWare, userController.getDetailsUser)
router.post('/refresh-token', userController.refreshToken)
module.exports = router