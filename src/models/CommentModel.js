// Import mongoose
const mongoose = require('mongoose');

// Định nghĩa schema cho Comment
const commentSchema = new mongoose.Schema({
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article', // Tham chiếu đến model Article
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

// Tạo model Comment từ schema đã định nghĩa
const Comment = mongoose.model('Comment', commentSchema);

// Export model Comment để sử dụng ở những file khác
module.exports = Comment;
