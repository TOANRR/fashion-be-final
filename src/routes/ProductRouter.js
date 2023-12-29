const express = require("express");
const router = express.Router();
const { authMiddleWare, authUserMiddleWare } = require("../middleware/AuthMiddleware");
const ProductController = require('../controllers/ProductController');
router.post('/create', ProductController.createProduct)
router.put('/update/:id', authMiddleWare, ProductController.updateProduct)
router.get('/get-details/:id', ProductController.getDetailsProduct)
router.delete('/delete/:id', authMiddleWare, ProductController.deleteProduct)
router.get('/get-all', ProductController.getAllProduct)
router.post('/delete-many', authMiddleWare, ProductController.deleteMany)
router.get('/get-all-type', ProductController.getAllType)
module.exports = router