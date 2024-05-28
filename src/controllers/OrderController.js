const Order = require('../models/OrderModel');
const OrderService = require('../services/OrderService')
const { ObjectId } = require('mongodb');

const getNewObjectId = (req, res) => {
    try {
        // Tạo một ObjectId mới
        const newObjectId = new ObjectId();

        // Trả về ObjectId mới trong phản hồi
        res.status(200).json({ success: true, objectId: newObjectId });
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Error creating new ObjectId:', error);
        res.status(404).json({ success: false, error: 'Internal server error' });
    }
};
const createOrder = async (req, res) => {
    try {
        let shipping = false;
        const { paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, district, ward, phone, delivery, email } = req.body
        // console.log(paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone);
        if (shippingPrice !== undefined) shipping = true;
        if (!paymentMethod || !itemsPrice || !shipping || !totalPrice || !fullName || !address || !city || !phone || !district || !ward || !delivery || !email) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        }
        const response = await OrderService.createOrder(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getAllOrderDetails = async (req, res) => {
    try {
        const userId = req.params.id
        if (!userId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await OrderService.getAllOrderDetails(userId)
        return res.status(200).json(response)
    } catch (e) {
        // console.log(e)
        return res.status(404).json({
            message: e
        })
    }
}

const getDetailsOrder = async (req, res) => {
    try {
        const orderId = req.params.id
        if (!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await OrderService.getOrderDetails(orderId)
        return res.status(200).json(response)
    } catch (e) {
        // console.log(e)
        return res.status(404).json({
            message: e
        })
    }
}

const cancelOrderDetails = async (req, res) => {
    try {
        const data = req.body.orderItems
        const orderId = req.body.orderId
        const cancelReason = req.body.cancelReason

        if (!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The orderId is required'
            })
        }
        const response = await OrderService.cancelOrderDetails(orderId, data, cancelReason)
        return res.status(200).json(response)
    } catch (e) {
        // console.log(e)
        return res.status(404).json({
            message: e
        })
    }
}
const cancelOrderDetailsAdmin = async (req, res) => {
    try {
        const orderId = req.body.orderId
        const cancelReason = req.body.cancelReason

        if (!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The orderId is required'
            })
        }
        const response = await OrderService.cancelOrderDetailsAdmin(orderId, cancelReason)
        return res.status(200).json(response)
    } catch (e) {
        // console.log(e)
        return res.status(404).json({
            message: e
        })
    }
}
const deleteOrderDetails = async (req, res) => {
    try {
        // const data = req.body.orderItems

        const orderId = req.body.orderId
        console.log(orderId)
        if (!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The orderId is required'
            })
        }
        const response = await OrderService.deleteOrderDetails(orderId)
        return res.status(200).json(response)
    } catch (e) {
        // console.log(e)
        return res.status(404).json({
            message: e
        })
    }
}

const getAllOrder = async (req, res) => {
    try {
        const { start, end } = req.query
        // console.log(start, end, req.query)
        const data = await OrderService.getAllOrder(start, end)
        return res.status(200).json(data)
    } catch (e) {
        // console.log(e)
        return res.status(404).json({
            message: e
        })
    }
}
const checkProductOrderedByUser = async (req, res) => {
    try {
        // Tìm kiếm đơn hàng

        const { userId, productId } = req.body
        if (!userId) return res.status(200).json({ status: "ERR", message: "Bạn chưa đăng nhập" })
        const order = await Order.findOne({
            user: userId, // Điều kiện: user là userId được truyền vào
            isCancel: false, // Điều kiện: isCancel là false
            'orderItems.product': productId // Điều kiện: có orderItem nào có product là productId
        });
        if (order) {
            console.log(order)

            // Trả về mã trạng thái 200 và thông báo
            return res.status(200).json({ status: "OK", message: "OK" })
        } else {
            // Trả về mã trạng thái 404 và thông báo
            return res.status(200).json({ status: "ERR", message: "Bạn phải đặt mua sản phẩm mới có thể đánh giá" })
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra đơn hàng: ', error);
        // Trả về mã trạng thái 500 nếu có lỗi xảy ra
        return { status: 500, message: 'Có lỗi xảy ra khi kiểm tra đơn hàng.' };
    }
};
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            delivery,
            totalPrice,
            user,
            isPaid,
            paidAt,
            deliveryStatus,
            deliveredAt,
            isCancel
        } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(id, {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            delivery,
            totalPrice,
            user,
            isPaid,
            paidAt,
            deliveryStatus,
            deliveredAt,
            isCancel
        }, { new: true });

        res.status(200).json({ message: "OK" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
const getTotalRevenueAndOrders = async (req, res) => {
    try {
        const totalRevenueAndOrders = await Order.aggregate([
            { $match: { isCancel: false, isPaid: true } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);
        res.json({
            totalRevenue: totalRevenueAndOrders[0].totalRevenue,
            totalOrders: totalRevenueAndOrders[0].totalOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Controller để lấy doanh thu từng tháng
const getRevenueInRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Convert startDate and endDate from strings to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        // Log dates for debugging
        console.log(`Start Date: ${start}, End Date: ${end}`);

        // Query the database to get total revenue per day in the specified date range
        const revenueByDay = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: start, // Greater than or equal to start date
                        $lte: end    // Less than or equal to end date
                    },
                    isPaid: true,// Only include orders that are paid,
                    isCancel: false
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "Asia/Ho_Chi_Minh" // Format date in Vietnam's time zone
                        }
                    },
                    totalRevenue: { $sum: "$totalPrice" } // Sum totalPrice for each day
                }
            },
            {
                $sort: { _id: 1 } // Sort by date in ascending order
            }
        ]);

        // Log the result for debugging
        console.log("Revenue by Day:", revenueByDay);

        // Send the result back to the client
        res.json(revenueByDay);
    } catch (error) {
        console.error("Error fetching revenue in range:", error);
        res.status(404).json({ message: "Server error" });
    }
};

const searchOrdersByStatus = async (req, res) => {
    const { status } = req.query;
    const userId = req.params.id; // Lấy userId từ req.params

    try {
        let orders;

        // Tìm kiếm đơn hàng theo trạng thái và id người dùng
        switch (status) {
            case 'all':
                orders = await Order.find({ user: userId }).sort({ createdAt: -1 }); // Lọc theo id người dùng
                break;
            case 'unpaid':
                orders = await Order.find({ user: userId, isPaid: false, isCancel: false }).sort({ createdAt: -1 });
                break;
            case 'paid':
                orders = await Order.find({ user: userId, isPaid: true, isCancel: false }).sort({ createdAt: -1 });
                break;
            case 'not_shipped':
                orders = await Order.find({ user: userId, deliveryStatus: 'not_delivered', isCancel: false }).sort({ createdAt: -1 });
                break;
            case 'shipping':
                orders = await Order.find({ user: userId, deliveryStatus: 'delivering', isCancel: false }).sort({ createdAt: -1 });
                break;
            case 'shipped':
                orders = await Order.find({ user: userId, deliveryStatus: 'delivered', isCancel: false }).sort({ createdAt: -1 });
                break;
            case 'cancelled':
                orders = await Order.find({ user: userId, isCancel: true }).sort({ createdAt: -1 });
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('Error searching orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
const ratioCancelled = async (req, res) => {
    try {
        // Query database to get total number of orders
        const totalOrdersCount = await Order.countDocuments();

        // Query database to get cancelled orders count
        const cancelledOrdersCount = await Order.countDocuments({ isCancel: true });

        // Calculate cancellation ratio
        const cancellationRatio = (cancelledOrdersCount / totalOrdersCount) * 100;

        // Send data as JSON response
        const roundedCancellationRatio = Math.round(cancellationRatio * 10) / 10;
        res.json({ roundedCancellationRatio });
    } catch (error) {
        console.error('Error fetching cancellation ratio:', error);
        res.status(404).json({ error: 'Internal server error' });
    }
};



module.exports = {
    createOrder,
    getAllOrderDetails,
    getDetailsOrder,
    cancelOrderDetails,
    getAllOrder,
    deleteOrderDetails,
    checkProductOrderedByUser,
    updateOrder,
    getTotalRevenueAndOrders,
    getRevenueInRange,
    searchOrdersByStatus,
    cancelOrderDetailsAdmin,
    ratioCancelled,
    getNewObjectId

}