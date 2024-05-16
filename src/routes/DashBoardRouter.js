const express = require("express");
const router = express.Router()
const dashBoardController = require('../controllers/DashBoardController');
const { authMiddleWare, authUserMiddleWare } = require("../middleware/AuthMiddleware");

router.get('/total-revenue-and-orders', authMiddleWare, dashBoardController.getTotalRevenueAndOrders);

module.exports = router