const Product = require("../models/ProductModel")
const { ObjectId } = require('mongodb');
const Review = require("../models/ReviewModel");
const axios = require('axios');
const dotenv = require('dotenv');
const { isEqual } = require('lodash');

dotenv.config()
const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const { name, images, type, category, price, description, sizes, discount } = newProduct;
        try {
            const checkProduct = await Product.findOne({
                name: name
            });
            if (checkProduct !== null) {
                resolve({
                    status: 'ERR',
                    message: 'The name of product is already'
                });
                return;
            }
            const createdProduct = await Product.create({
                name,
                images,
                type,
                category,
                price,
                sizes,
                description,
                discount
            });
            if (createdProduct) {
                // Gửi hình ảnh và ID sản phẩm tới URL chỉ định
                try {
                    const response = await axios.post(`${process.env.Flask_Server}/create`, {
                        id: createdProduct._id,
                        images: createdProduct.images
                    });
                    // console.log('Response from server:', response.data);
                } catch (error) {
                    console.error('Error sending data to server:', error);
                }

                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdProduct
                });
            }
        } catch (e) {
            reject(e);
        }
    });
}

const updateProduct = async (id, newData) => {
    try {
        // Tìm sản phẩm cần cập nhật
        const checkProduct = await Product.findOne({ _id: id });
        if (!checkProduct) {
            return { status: 'ERR', message: 'The product is not defined' };
        }

        // Sao lưu dữ liệu hiện tại của sản phẩm
        const backupProduct = { ...checkProduct.toObject() };

        // Cập nhật dữ liệu sản phẩm trong cơ sở dữ liệu
        const updatedProduct = await Product.findByIdAndUpdate(id, newData, { new: true });

        // Kiểm tra xem dữ liệu hình ảnh mới có khác so với dữ liệu hiện tại hay không
        const isImageChanged = !isEqual(checkProduct.images, newData.images);
        console.log(isImageChanged)
        // Nếu dữ liệu hình ảnh đã thay đổi, thực hiện cập nhật trên server localhost:5000
        if (isImageChanged) {
            const response = await axios.post(`${process.env.Flask_Server}/update`, {
                id: id,
                images: newData.images
            });
            if (response.data.status !== 'OK') {
                // Nếu cập nhật không thành công, phục hồi lại dữ liệu từ backup
                await Product.findByIdAndUpdate(id, backupProduct, { new: true });
                return { status: 'ERR', message: 'Failed to update product on server' };
            }
        }

        return { status: 'OK', message: 'SUCCESS', data: updatedProduct };
    } catch (error) {
        return { status: 'ERR', message: error.message };
    }
};


const deleteProduct = (id) => {
    let backupProduct;
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findOne({ _id: id });
            if (checkProduct === null) {
                resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                });
            }

            // Sao lưu sản phẩm trước khi xóa
            backupProduct = { ...checkProduct.toObject() };

            // Xóa sản phẩm từ cơ sở dữ liệu
            await Product.findByIdAndDelete(id);

            // Gửi yêu cầu HTTP DELETE đến localhost:5000/delete/<product_id>
            await axios.delete(`${process.env.Flask_Server}/delete/${id}`);

            resolve({
                status: 'OK',
                message: 'Delete product success',
            });
        } catch (error) {
            // Nếu xảy ra lỗi, phục hồi lại sản phẩm từ bản sao đã sao lưu
            if (backupProduct) {
                await Product.create(backupProduct);
            }
            reject(error);
        }
    });
};


const deleteProductSupport = async (id) => {
    try {
        await Product.deleteOne({ _id: id });
        return { status: 'OK', message: 'Delete product success' };
    } catch (error) {
        return { status: 'ERR', message: 'Error deleting product' };
    }
};

const deleteManyProduct = async (ids) => {
    const deletedProducts = [];
    const restoredProducts = [];

    // Lặp qua mảng các ID sản phẩm và thực hiện xóa từng sản phẩm một
    for (const id of ids) {
        const deleteResult = await deleteProductSupport(id);
        deletedProducts.push({ id, result: deleteResult });

        // Nếu xóa thành công, gửi yêu cầu xóa tới máy chủ 5000
        if (deleteResult.status === 'OK') {
            try {
                await axios.delete(`${process.env.Flask_Server}/delete/${id}`);
            } catch (error) {
                // Nếu gặp lỗi khi gửi yêu cầu xóa tới máy chủ 5000, thực hiện khôi phục lại các sản phẩm đã xóa trước đó
                restoredProducts.push(await restoreDeletedProducts(deletedProducts));
                return { status: 'ERR', message: 'Error deleting product on server 5000', deletedProducts, restoredProducts };
            }
        }
    }

    return { status: 'OK', message: 'All products deleted successfully', deletedProducts };
};

const restoreDeletedProducts = async (deletedProducts) => {
    const restoredProducts = [];
    // Lặp qua mảng các sản phẩm đã xóa và thực hiện khôi phục lại từng sản phẩm
    for (const { id } of deletedProducts) {
        try {
            await Product.create({ _id: id }); // Giả sử phương thức create này tạo mới một sản phẩm với ID nhất định
            restoredProducts.push({ id, status: 'OK', message: 'Product restored' });
        } catch (error) {
            restoredProducts.push({ id, status: 'ERR', message: 'Error restoring product' });
        }
    }
    return restoredProducts;
};

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
            // console.log("here")
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