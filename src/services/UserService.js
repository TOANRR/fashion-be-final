const Review = require("../models/ReviewModel")
const User = require("../models/UserModel")
const { genneralAccessToken, genneralRefreshToken } = require("./jwtService")
const bcrypt = require("bcrypt")
const createUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { name, email, password, confirmPassword, phone } = newUser
        try {
            const checkUser = await User.findOne({
                email: email
            })
            if (checkUser !== null) {
                resolve({
                    status: 'ERR',
                    message: 'The email is already'
                })
            }
            const hash = bcrypt.hashSync(password, 10)
            const createdUser = await User.create({
                name,
                email,
                password: hash,
                phone
            })
            if (createdUser) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdUser
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
const loginUser = (userLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password } = userLogin
        try {
            const checkUser = await User.findOne({
                email: email
            })
            if (checkUser === null) {
                resolve({
                    status: 'ERR',
                    message: 'Không tồn tại người dùng'
                })
            }
            const comparePassword = bcrypt.compareSync(password, checkUser.password)

            if (!comparePassword) {
                resolve({
                    status: 'ERR',
                    message: 'Mật khẩu không đúng'
                })
            }
            const access_token = await genneralAccessToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })
            const refresh_token = await genneralRefreshToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })
            console.log('access_token:', access_token)
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                access_token: access_token,
                refresh_token: refresh_token
            })
        } catch (e) {
            reject(e)
        }
    })
}
const updateUser = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                _id: id
            })
            if (checkUser === null) {
                resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }
            if (data.password) {
                const hash = bcrypt.hashSync(data.password, 10)
                data.password = hash
            }

            const updatedUser = await User.findByIdAndUpdate(id, data, { new: true })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedUser
            })
            console.log("update:", updatedUser)
        } catch (e) {
            reject(e)
        }
    })
}
const deleteUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                _id: id
            })
            if (checkUser === null) {

                resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }
            if (checkUser.isAdmin == true) {
                resolve({
                    status: 'ERR',
                    message: 'Cannot delete an admin user'
                });
                return;
            }
            const result = await Review.deleteMany({ user: id });
            console.log(`${result.deletedCount} review(s) deleted.`);
            await User.findByIdAndDelete(id)
            resolve({
                status: 'OK',
                message: 'delete SUCCESS',

            })
        } catch (e) {
            reject(e)
        }
    })
}
const getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUser = await User.find().sort({ createdAt: -1, updatedAt: -1 })
            resolve({
                status: 'OK',
                message: 'Success',
                data: allUser
            })
        } catch (e) {
            reject(e)
        }
    })
}
const getDetailsUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({
                _id: id
            })
            if (user === null) {
                resolve({
                    status: 'ERR',
                    message: 'Không tồn tại người dùng'
                })
            }
            resolve({
                status: 'OK',
                message: 'SUCESS',
                data: user
            })
            // console.log(user)
        } catch (e) {
            reject(e)
        }
    })
}
const deleteManyUser = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tìm tất cả người dùng với các ID được cung cấp
            const users = await User.find({ _id: { $in: ids } });

            // Kiểm tra xem có bất kỳ người dùng nào là admin không
            const admins = users.filter(user => user.isAdmin === true);

            if (admins.length > 0) {
                resolve({
                    status: 'ERR',
                    message: 'Không thể xóa admin'
                });
                return;
            }

            // Xóa các bài đánh giá của người dùng
            await Review.deleteMany({ user: { $in: ids } });

            // Xóa các người dùng không phải admin
            await User.deleteMany({ _id: { $in: ids } });
            resolve({
                status: 'OK',
                message: 'Xóa người dùng thành công',
            });
        } catch (e) {
            reject(e);
        }
    });
}
module.exports = {
    createUser, loginUser, updateUser, deleteUser, getAllUser, getDetailsUser, deleteManyUser
}