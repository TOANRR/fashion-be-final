const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        images: [{
            type: String,
            required: true
        }],
        type: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        sizes: [{
            size: {
                type: String,
                required: true
            },
            countInStock: {
                type: Number,
                required: true
            }
        }],
        description: { type: String },
        discount: { type: Number },
        selled: { type: Number }
    },
    {
        timestamps: true,
    }
);
productSchema.index({
    name: 'text',
    type: 'text',
    category: 'text',

});
const Product = mongoose.model('Product', productSchema);

module.exports = Product;