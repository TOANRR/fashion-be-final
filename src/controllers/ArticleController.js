const Article = require('../models/ArticleModel');

const createArticle = async (req, res) => {
    try {
        const { title, content, author, coverImage } = req.body;
        // console.log(title, content, author, coverImage)
        const article = new Article({ title, content, author, coverImage });
        const savedArticle = await article.save();
        res.status(200).json({ success: true, data: savedArticle });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(404).json({ error: 'Server error' });
    }
};
const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find().populate('author', 'name');
        res.json(articles);
    } catch (error) {
        console.error('Error getting all articles:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, author, coverImage } = req.body;
        const updatedArticle = await Article.findByIdAndUpdate(id, { title, content, author, coverImage }, { new: true });
        res.status(200).json({ success: true, data: updatedArticle });
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(404).json({ error: 'Server error' });
    }
};
const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        await Article.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(404).json({ error: 'Server error' });
    }
};
const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article.findById(id).populate('author', 'name').sort({ createdAt: -1 });;
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        console.error('Error getting article by ID:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
module.exports = {
    createArticle,
    updateArticle,
    getAllArticles,
    deleteArticle,
    getArticleById
}