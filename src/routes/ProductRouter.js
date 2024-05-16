const express = require("express");
const router = express.Router();
const { authMiddleWare, authUserMiddleWare } = require("../middleware/AuthMiddleware");
const ProductController = require('../controllers/ProductController');
router.post('/create', ProductController.createProduct)
router.put('/update/:id', authMiddleWare, ProductController.updateProduct)
router.get('/get-details/:id', ProductController.getDetailsProduct)
router.get('/get-details-admin/:id', ProductController.getDetailsProductAdmin)

router.delete('/delete/:id', authMiddleWare, ProductController.deleteProduct)
router.get('/get-all', ProductController.getAllProduct)
router.post('/get-all-obj', ProductController.findManyByObj)
router.post('/delete-many', authMiddleWare, ProductController.deleteMany)
router.get('/get-all-type', ProductController.getAllType)
router.get('/types-categories', ProductController.getTypeCategories)
router.post('/filter-product', ProductController.filterProduct)
router.get('/product-type/:type', ProductController.getProductByType)
router.get('/categories', ProductController.getCategories)
router.post('/search-image', ProductController.searchImage)
router.get('/total-product', ProductController.getTotalProducts)

module.exports = router