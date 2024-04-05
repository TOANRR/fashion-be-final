const express = require("express");
const router = express.Router()
const CardController = require('../controllers/CardController');
const { authMiddleWare, authUserMiddleWare } = require("../middleware/AuthMiddleware");

router.post('/create/:id', authUserMiddleWare, CardController.createCard)
router.get('/get-all-items/:id', CardController.getAllItems)
// router.get('/get-details-order/:id', OrderController.getDetailsOrder)
router.delete('/delete/:id', authUserMiddleWare, CardController.deleteCard)
// router.get('/get-all-order', authMiddleWare, OrderController.getAllOrder)


module.exports = router