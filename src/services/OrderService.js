const { data } = require("jquery")
const Card = require("../models/CardModel")
const Order = require("../models/OrderModel")
const Product = require("../models/ProductModel")
const { sendEmailCreateOrder } = require("./EmailService")
// const EmailService = require("../services/EmailService")

const createOrder = (newOrder) => {
    return new Promise(async (resolve, reject) => {
        const { orderItems, paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, district, ward, phone, user, isPaid, paidAt, email, delivery } = newOrder
        try {
            // sendEmailCreateOrder()
            const promises = orderItems.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: order.product,
                        'sizes': {
                            $elemMatch: {
                                size: order.size,
                                countInStock: { $gte: order.amount }
                            }
                        }
                    },
                    {
                        $inc: {
                            'sizes.$.countInStock': -order.amount,
                            selled: +order.amount
                        }
                    },
                    { new: true }
                )

                console.log(productData)
                if (productData) {
                    return {
                        status: 'OK',
                        message: 'SUCCESS'
                    }
                }
                else {
                    return {
                        status: 'OK',
                        message: 'ERR',
                        id: order.product
                    }
                }
            })
            const promisesDelete = orderItems.map(async (order) => {
                await Card.deleteOne(
                    {
                        user: user,
                        product: order.product,
                        size: order.size
                    }
                )
                return {
                    status: 'OK',
                    message: 'SUCCESS'
                }

            })
            const results = await Promise.all(promises, promisesDelete)
            const newData = results && results.filter((item) => item.id)
            if (newData.length) {
                const arrId = []
                newData.forEach((item) => {
                    arrId.push(item.id)
                })
                resolve({
                    status: 'ERR',
                    message: `Sản phẩm với id: ${arrId.join(',')} không đủ hàng`
                })
            } else {
                const createdOrder = await Order.create({
                    orderItems,
                    shippingAddress: {
                        fullName,
                        address,
                        city, phone, ward, district
                    },
                    paymentMethod,
                    itemsPrice,
                    shippingPrice,
                    totalPrice,
                    user: user,
                    isPaid, paidAt, delivery
                })
                if (createdOrder) {
                    // await sendEmailCreateOrder(email, orderItems, totalPrice)
                    resolve({
                        status: 'OK',
                        message: 'success',
                        data: createdOrder
                    })
                }
            }
            // resolve({
            //     status: 'OK',
            //     message: 'success',
            // }

        } catch (e) {
            //   console.log('e', e)
            reject(e)
        }
    })
}

// const deleteManyProduct = (ids) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             await Product.deleteMany({ _id: ids })
//             resolve({
//                 status: 'OK',
//                 message: 'Delete product success',
//             })
//         } catch (e) {
//             reject(e)
//         }
//     })
// }

const getAllOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.find({
                user: id
            }).sort({ createdAt: -1, updatedAt: -1 })
            if (order === null) {
                resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCESSS',
                data: order
            })
        } catch (e) {
            // console.log('e', e)
            reject(e)
        }
    })
}

const getOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findById({
                _id: id
            })
            if (order === null) {
                resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCESSS',
                data: order
            })
        } catch (e) {
            // console.log('e', e)
            reject(e)
        }
    })
}

const deleteOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let orders = await Order.findById(id);
            orders = orders.orderItems
            console.log(orders)
            const promises = orders.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: order.product,
                        'sizes.size': order.size,
                        selled: { $gte: order.amount }
                    },
                    {
                        $inc: {
                            'sizes.$.countInStock': +order.amount,
                            selled: -order.amount
                        }
                    },
                    { new: true }
                )
                if (productData) {
                    order = await Order.findByIdAndDelete(id)
                    if (order === null) {
                        resolve({
                            status: 'ERR',
                            message: 'The order is not defined'
                        })
                    }
                } else {
                    return {
                        status: 'OK',
                        message: 'ERR',
                        id: order.product
                    }
                }
            })
            const results = await Promise.all(promises)
            const newData = results && results[0] && results[0].id

            if (newData) {
                resolve({
                    status: 'ERR',
                    message: `San pham voi id: ${newData} khong ton tai`
                })
            }
            resolve({
                status: 'OK',
                message: 'success',
                data: order
            })
        } catch (e) {
            reject(e)
        }
    })
}
const cancelOrderDetails = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let order = []
            const promises = data.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: order.product,
                        'sizes.size': order.size,
                        selled: { $gte: order.amount }
                    },
                    {
                        $inc: {
                            'sizes.$.countInStock': +order.amount,
                            selled: -order.amount
                        }
                    },
                    { new: true }
                )
                if (productData) {
                    const order = await Order.findOneAndUpdate(
                        { _id: id }, // Điều kiện tìm kiếm
                        { isCancel: true }, // Dữ liệu cập nhật
                        { new: true } // Tùy chọn để trả về bản ghi đã được cập nhật
                    );
                    console.log(order)
                    if (order === null) {
                        resolve({
                            status: 'ERR',
                            message: 'The order is not defined'
                        })
                    }
                } else {
                    return {
                        status: 'OK',
                        message: 'ERR',
                        id: order.product
                    }
                }
            })
            const results = await Promise.all(promises)
            const newData = results && results[0] && results[0].id

            if (newData) {
                resolve({
                    status: 'ERR',
                    message: `San pham voi id: ${newData} khong ton tai`
                })
            }
            resolve({
                status: 'OK',
                message: 'success',
                data: order
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllOrder = () => {
    return new Promise(async (resolve, reject) => {
        try {

            const allOrder = await Order.find().sort({ createdAt: -1, updatedAt: -1 })
            resolve({
                status: 'OK',
                message: 'Success',
                data: allOrder
            })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createOrder,
    getAllOrderDetails,
    getOrderDetails,
    cancelOrderDetails,
    getAllOrder,
    deleteOrderDetails
}