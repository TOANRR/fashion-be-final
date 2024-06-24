// Import model Comment
const Comment = require('../models/CommentModel');

// Controller để tạo comment mới
exports.createComment = async (req, res) => {
    try {
        const { articleId, content, author } = req.body;
        const newComment = new Comment({ articleId, content, author });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller để chỉnh sửa comment
exports.updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const updatedComment = await Comment.findByIdAndUpdate(id, { content }, { new: true });
        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller để xóa comment
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedComment = await Comment.findByIdAndDelete(id);
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json({ success: true, deletedComment });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller để lấy tất cả các comment
exports.getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find().populate({
            path: 'author',
            select: 'name email avatar' // Chỉ lấy thông tin name, email, avatar của tác giả
        })
            .populate({
                path: 'articleId',
                model: 'Article', // Tên của model Article
                select: 'title' // Chỉ lấy thông tin title của bài báo
            }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller để reply comment
// exports.replyToComment = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { content, author } = req.body;
//         const parentComment = await Comment.findById(id);
//         if (!parentComment) {
//             return res.status(404).json({ message: 'Parent comment not found' });
//         }
//         const reply = new Comment({ articleId: parentComment.articleId, content, author });
//         await reply.save();
//         parentComment.replies.push(reply);
//         await parentComment.save();
//         res.status(201).json(reply);
//     } catch (error) {
//         console.error('Error replying to comment:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };
exports.getCommentsByArticleId = async (req, res) => {
    const { articleId } = req.params;
    try {
        const comments = await Comment.find({ articleId }).populate('author', 'name email avatar').sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};