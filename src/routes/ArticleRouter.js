const express = require('express');
const router = express.Router();
const articleController = require('../controllers/ArticleController');

router.post('/create', articleController.createArticle);
router.get('/get-all', articleController.getAllArticles);
router.put('/update/:id', articleController.updateArticle);
router.delete('/delete/:id', articleController.deleteArticle);
router.get('/get-article/:id', articleController.getArticleById);

module.exports = router;
