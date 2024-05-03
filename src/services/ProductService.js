const Product = require("../models/ProductModel")
const { ObjectId } = require('mongodb');
const Review = require("../models/ReviewModel");

const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const { name, images, type, category, price, description, sizes, discount } = newProduct
        try {
            const checkProduct = await Product.findOne({
                name: name
            })
            if (checkProduct !== null) {
                resolve({
                    status: 'ERR',
                    message: 'The name of product is already'
                })
            }
            const newProduct = await Product.create({
                name,
                images,
                type,
                category,
                price,
                sizes,
                description,
                discount
            })
            if (newProduct) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: newProduct
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

const updateProduct = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findOne({
                _id: id
            })
            if (checkProduct === null) {
                resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                })
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedProduct
            })
        } catch (e) {
            reject(e)
        }
    })
}

const deleteProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findOne({
                _id: id
            })
            if (checkProduct === null) {
                resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                })
            }

            await Product.findByIdAndDelete(id)
            resolve({
                status: 'OK',
                message: 'Delete product success',
            })
        } catch (e) {
            reject(e)
        }
    })
}

const deleteManyProduct = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {
            await Product.deleteMany({ _id: ids })
            resolve({
                status: 'OK',
                message: 'Delete product success',
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getDetailsProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Sử dụng aggregate để tính toán rating trung bình của các review cho sản phẩm cụ thể
            // console.log("nice")
            const ratingAggregate = await Review.aggregate([
                { $match: { product: new ObjectId(id) } }, // Lọc các review cho sản phẩm cụ thể
                { $group: { _id: null, averageRating: { $avg: "$rating" } } } // Tính toán rating trung bình
            ]);
            // console.log(ratingAggregate)
            // Tìm kiếm thông tin sản phẩm qua productId và populate reviews
            const product = await Product.findById(id);

            if (!product) {
                resolve({
                    status: 'ERR',
                    message: 'Product not found'
                })

            }

            // Lấy ra rating trung bình từ kết quả aggregate
            const averageRating = ratingAggregate.length > 0 ? ratingAggregate[0].averageRating : 0;

            resolve({
                status: 'OK',
                message: 'Product found',
                data: {
                    product,
                    averageRating // Thêm rating trung bình vào dữ liệu trả về
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

const getAllProduct = (limit, page, sort, filter) => {

    return new Promise(async (resolve, reject) => {
        try {

            const totalProduct = await Product.countDocuments()
            let allProduct = []
            if (filter) {
                const label = filter[0];
                const allObject = await Product.find({ [label]: { '$regex': filter[1], $options: "i" } })
                const allObjectFilter = await Product.find({ [label]: { '$regex': filter[1], $options: "i" } }).limit(limit).skip(page * limit).sort({ createdAt: -1, updatedAt: -1 })
                resolve({
                    status: 'OK',
                    message: 'Success',
                    data: allObjectFilter,
                    total: allObject.length,
                    pageCurrent: Number(page + 1),
                    totalPage: Math.ceil(allObject.length / limit)
                })
            }
            else
                if (sort) {
                    const objectSort = {}
                    objectSort[sort[1]] = sort[0]
                    const allProductSort = await Product.find().limit(limit).skip(page * limit).sort(objectSort).sort({ createdAt: -1, updatedAt: -1 })
                    resolve({
                        status: 'OK',
                        message: 'Success',
                        data: allProductSort,
                        total: allProductSort.length,
                        pageCurrent: Number(page + 1),
                        totalPage: Math.ceil(allProductSort.length / limit)
                    })
                }
                else {
                    if (!limit) {
                        allProduct = await Product.find().sort({ createdAt: -1, updatedAt: -1 })
                    } else {
                        allProduct = await Product.find().limit(limit).skip(page * limit).sort({ createdAt: -1, updatedAt: -1 })
                    }
                    resolve({
                        status: 'OK',
                        message: 'Success',
                        data: allProduct,
                        total: totalProduct,
                        pageCurrent: Number(page + 1),
                        totalPage: Math.ceil(totalProduct / limit)
                    })
                }

        } catch (e) {
            reject(e)
        }
    })
}

const getAllType = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allType = await Product.distinct('type')
            resolve({
                status: 'OK',
                message: 'Success',
                data: allType,
            })
        } catch (e) {
            reject(e)
        }
    })
}

const findManyByObj = (limit, page, ids) => {

    return new Promise(async (resolve, reject) => {
        // try {

        // console.log("limit, page, ids", limit, page, ids)
        let allProduct = []
        // var query = [
        //    ,
        //     // { $addFields: { "__ids": { $indexOfArray: [ids, "$_id"] } } },
        //     // { $sort: { "__ids": 1 } }
        // ];
        var oids = [];
        ids.forEach(function (item) {
            oids.push(new ObjectId(item));
        });

        allProduct = await Product.aggregate([
            {
                $match: { '_id': { $in: oids } },

            },
            { $addFields: { "__ids": { $indexOfArray: [oids, "$_id"] } } },
            { $sort: { "__ids": 1 } },
            { $limit: Number(limit) },
            { $skip: Number(page) * Number(limit) }
        ]);
        //  console.log("all", allProduct)
        // if (!limit) {
        //     allProduct = await Product.find({ '_id': { $in: ids } });
        // } else {
        //     allProduct = await Product.find({ '_id': { $in: ids } }).limit(limit).skip(page * limit);
        // }
        resolve({
            status: 'OK',
            message: 'Success',
            data: allProduct,
            total: allProduct.length,
            pageCurrent: Number(page + 1),
            totalPage: Math.ceil(allProduct.length / limit)
        })
        // } catch (e) {
        //     reject(e)
        // }
    })
}
const getDetailsProductAdmin = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("here")
            const product = await Product.findOne({
                _id: id
            })
            if (product === null) {
                resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCESS',
                data: product
            })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createProduct,
    updateProduct,
    getDetailsProduct,
    deleteProduct,
    getAllProduct,
    deleteManyProduct,
    getAllType,
    findManyByObj,
    getDetailsProductAdmin
}