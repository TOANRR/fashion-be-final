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
        const keywords = productName.split(" ");
        // Tạo một mảng chứa các biểu thức chính quy để tìm từng từ khóa trong mỗi trường
        const results = await Product.find(
            { $text: { $search: productName } }, // Tìm kiếm gần đúng
            { score: { $meta: "textScore" } } // Lấy điểm số của kết quả
        )
            .sort({ score: { $meta: "textScore" } }); // Sắp xếp theo điểm số giảm dần

        // Lọc kết quả chỉ lấy những sản phẩm có đủ các từ trong từ khóa tìm kiếm
        const filteredResults = results.filter(product =>
            keywords.every(keyword => product.name.toLowerCase().includes(keyword.toLowerCase()) ||
                product.type.toLowerCase().includes(keyword.toLowerCase()) ||
                product.category.toLowerCase().includes(keyword.toLowerCase())

            )
        );
        return filteredResults[0];
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

module.exports = {
    getProductByName,
    findSimilarProduct
};