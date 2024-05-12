const Order = require('../models/OrderModel');
const OrderService = require('../services/OrderService')

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
        if (!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The orderId is required'
            })
        }
        const response = await OrderService.cancelOrderDetails(orderId, data)
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
        const data = await OrderService.getAllOrder()
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
module.exports = {
    createOrder,
    getAllOrderDetails,
    getDetailsOrder,
    cancelOrderDetails,
    getAllOrder,
    deleteOrderDetails,
    checkProductOrderedByUser,
    updateOrder

}