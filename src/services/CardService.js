const Card = require("../models/CardModel")
const Product = require("../models/ProductModel")
// const EmailService = require("../services/EmailService")

const createCard = (newItem) => {
    return new Promise(async (resolve, reject) => {
        const { quantity, product, user, size } = newItem
        try {
            const checkItem = await Card.findOne({
                product: product,
                user: user,
                size: size
            })

            if (checkItem !== null) {
                console.log("check", checkItem._id);
                const updatedItem = await Card.findOneAndUpdate(
                    { "product": product, "user": user, "size": size },
                    { "quantity": quantity * 1 + checkItem.quantity * 1 },
                    { new: true }

                )
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: updatedItem
                })
            }
            else {
                const newItem = await Card.create({
                    user,
                    product,
                    quantity,
                    size

                })
                if (newItem) {
                    resolve({
                        status: 'OK',
                        message: 'SUCCESS',
                        data: newItem
                    })
                }
            }

        } catch (e) {
            reject(e)
        }
    })
}
const deleteCard = (item) => {
    return new Promise(async (resolve, reject) => {
        const { product, user, size } = item

        try {
            const checkItem = await Card.findOne({
                product: product,
                user: user,
                size: size
            })
            console.log(checkItem)
            if (checkItem !== null) {

                await Card.findByIdAndDelete(checkItem._id)
                resolve({
                    status: 'OK',
                    message: 'Delete item success',

                })
            }
            else {
                resolve({
                    status: 'ERROR',
                    message: 'CANT FIND'
                })

            }

        } catch (e) {
            reject(e)
        }
    })
}
const getAllItems = (user) => {
    return new Promise(async (resolve, reject) => {

        try {
            console.log(user)
            // const allItems = await Card.aggregate([
            //     { $match: { $expr: { $eq: ['$user', { $toObjectId: user }] } } },
            //     {
            //         $lookup:
            //         {
            //             from: "products",
            //             localField: "product",
            //             foreignField: "_id",
            //             as: "product"
            //         }
            //     },
            //     {
            //         $unwind: '$product' // Giải nén mảng kết quả để hiển thị một bản ghi cho mỗi sản phẩm
            //     },
            //     {
            //         $addFields: {
            //             countInStock: { $multiply: ['$product.price', '$quantity'] } // Thêm trường totalPrice bằng cách nhân giá sản phẩm với số lượng
            //         }
            //     }
            // ])
            // const allItems = Card.find({ user: user })
            // // .populate('product') // Lấy thông tin chi tiết của sản phẩm
            // // .exec((err, cards) => {
            // //     if (err) {
            // //         console.error('Error:', err);
            // //         return;
            // //     }
            // //     console.log(cards);
            // // });
            const allItems = await Card.aggregate([
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        matchedSize: {
                            $filter: {
                                input: '$product.sizes',
                                as: 'size',
                                cond: { $eq: ['$$size.size', '$size'] }
                            }
                        },
                        product: 1,
                        size: 1,
                        quantity: 1,

                    }
                },
                {
                    $unwind: '$matchedSize'
                },
                {
                    $addFields: {
                        countInStock: '$matchedSize.countInStock'
                    }
                },
                {
                    $project: {
                        product: 1,
                        size: 1,
                        countInStock: 1,
                        quantity: 1,

                    }
                },
            ])
            console.log(allItems.length)
            if (allItems) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: allItems
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    createCard,
    deleteCard,
    getAllItems
}