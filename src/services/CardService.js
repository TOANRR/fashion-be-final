const Card = require("../models/CardModel")
const Product = require("../models/ProductModel")
// const EmailService = require("../services/EmailService")

const createCard = (newItem) => {
    return new Promise(async (resolve, reject) => {
        const { quantity, product, user } = newItem
        try {
            const checkItem = await Card.findOne({
                product: product,
                user: user
            })

            if (checkItem !== null) {
                console.log("check", checkItem._id);
                const updatedItem = await Card.findOneAndUpdate(
                    { "product": product, "user": user },
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
                    quantity

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
        const { product, user } = item

        try {
            const checkItem = await Card.findOne({
                product: product,
                user: user
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
            const allItems = await Card.aggregate([
                { $match: { $expr: { $eq: ['$user', { $toObjectId: user }] } } },
                {
                    $lookup:
                    {
                        from: "products",
                        localField: "product",
                        foreignField: "_id",
                        as: "product"
                    }
                }
            ])

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