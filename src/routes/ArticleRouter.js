const express = require('express');
const router = express.Router();
const articleController = require('../controllers/ArticleController');
const { authMiddleWare, authUserMiddleWare } = require("../middleware/AuthMiddleware");

router.post('/create', authMiddleWare, articleController.createArticle);
router.get('/get-all', articleController.getAllArticles);
router.put('/update/:id', authMiddleWare, articleController.updateArticle);
router.delete('/delete/:id', authMiddleWare, articleController.deleteArticle);
router.get('/get-article/:id', articleController.getArticleById);

module.exports = router;
