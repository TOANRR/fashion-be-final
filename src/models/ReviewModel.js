const mongoose = require('mongoose')
const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        rating: { type: Number, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, require: true }
    },
    {
        timestamps: true
    }
);
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;