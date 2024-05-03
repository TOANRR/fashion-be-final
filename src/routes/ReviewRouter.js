const express = require("express");
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const { authMiddleWare, authUserMiddleWare, authUser2MiddleWare } = require("../middleware/AuthMiddleware");

router.post('/create-review', authUser2MiddleWare, ReviewController.createOrUpdateReview)
router.get('/get-all-review/:id', ReviewController.getProductReviewsAndStats)


module.exports = router