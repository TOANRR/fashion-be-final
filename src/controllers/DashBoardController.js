// file: controllers/dashboardController.js
const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const Product = require('../models/ProductModel');

// Controller function to get total revenue and orders
const getTotalRevenueAndOrders = async (req, res) => {
    try {
        const totalRevenue = await Order.aggregate([
            {
                $match: { isCancel: false, isPaid: true } // Filter out cancelled and unpaid orders
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" }, // Calculate total revenue

                }
            }
        ]);

        const totalUsers = await User.countDocuments(); // Count total users

        const totalProducts = await Product.countDocuments(); // Count total products
        const totalOrders = await Order.countDocuments(); // Count total orders regardless of their status

        console.log(totalRevenue[0].totalRevenue,

            totalUsers,
            totalProducts)
        res.status(200).json({
            totalRevenue: totalRevenue[0].totalRevenue,
            totalOrders: totalOrders,
            totalusers: totalUsers,
            totalProducts: totalProducts
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: "Server Error" });
    }
};
module.exports = {

    getTotalRevenueAndOrders
}