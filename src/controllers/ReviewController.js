const Review = require('../models/ReviewModel');

// Controller để tạo hoặc cập nhật một đánh giá cho sản phẩm từ một người dùng
const createOrUpdateReview = async (req, res) => {
    const { product, user, rating, content } = req.body;

    try {
        // Tìm kiếm đánh giá dựa trên sản phẩm và người dùng
        let review = await Review.findOne({ product, user });

        // Nếu không tìm thấy đánh giá, tạo mới
        if (!review) {
            review = new Review({ product, user, rating, content });
        } else {
            // Nếu đã tồn tại, cập nhật đánh giá và nội dung
            review.rating = rating;
            review.content = content;
        }

        // Lưu hoặc cập nhật đánh giá
        await review.save();

        res.status(200).json({ success: true, message: 'Đánh giá đã được cập nhật hoặc tạo mới thành công.' });
    } catch (error) {
        res.status(404).json({ success: false, message: 'Đã xảy ra lỗi khi tạo hoặc cập nhật đánh giá.', error: error.message });
    }
};
const getProductReviewsAndStats = async (req, res) => {
    const productId = req.params.id;

    try {
        // Lấy tất cả các đánh giá của sản phẩm
        const reviews = await Review.find({ product: productId }).populate('user', 'name email avatar');;

        // Khởi tạo một đối tượng để thống kê số lượng đánh giá cho mỗi số sao
        const ratingStats = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        // Đếm số lượng đánh giá cho mỗi số sao
        reviews.forEach(review => {
            ratingStats[review.rating]++;
        });

        // Trả về kết quả thống kê
        res.status(200).json({ reviews, ratingStats });
    } catch (err) {
        // Xử lý lỗi nếu có
        res.status(404).json({ message: err.message });
    }
};
module.exports = { createOrUpdateReview, getProductReviewsAndStats };
