const Product = require('../models/ProductModel');

async function getProductByName(productName) {
    try {
        const product = await Product.findOne({ name: productName });
        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}
async function findSimilarProduct(productName) {
    try {
        const product = await Product.findOne({ name: { $regex: new RegExp(productName, "i") } });
        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

module.exports = {
    getProductByName,
    findSimilarProduct
};