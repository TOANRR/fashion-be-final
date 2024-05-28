const User = require('../models/UserModel')
const ResetPassword = require('../models/ResetPasswordModel')
const UserService = require('../services/UserService')
const JwtService = require('../services/jwtService')
const bcrypt = require("bcrypt")
const crypto = require('crypto');
const sendEmailResetPassword = require('../services/EmailService');
const createUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone } = req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = reg.test(email)
        if (!email || !password || !confirmPassword) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        } else if (!isCheckEmail) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is email'
            })
        } else if (password !== confirmPassword) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The password is equal confirmPassword'
            })
        }
        const response = await UserService.createUser(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = reg.test(email)
        if (!email || !password) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        } else if (!isCheckEmail) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is email'
            })
        }
        const response = await UserService.loginUser(req.body)
        const { refresh_token, ...newReponse } = response
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path: '/',
        })
        return res.status(200).json({ ...newReponse, refresh_token })
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id
        const data = req.body
        if (!userId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await UserService.updateUser(userId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id
        if (!userId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await UserService.deleteUser(userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}
const getAllUser = async (req, res) => {
    try {
        const response = await UserService.getAllUser()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getDetailsUser = async (req, res) => {
    try {
        const userId = req.params.id
        if (!userId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await UserService.getDetailsUser(userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}
const refreshToken = async (req, res) => {
    try {
        let token = req.headers.token.split(' ')[1]
        if (!token) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The token is required'
            })
        }
        const response = await JwtService.refreshTokenJwtService(token)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}
const logoutUser = async (req, res) => {
    try {
        res.clearCookie('refresh_token')
        return res.status(200).json({
            status: 'OK',
            message: 'Logout successfully'
        })
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}
const deleteMany = async (req, res) => {
    try {
        const ids = req.body.ids
        if (!ids) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The ids is required'
            })
        }
        const response = await UserService.deleteManyUser(ids)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}
const getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        res.json({ totalUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getUserCountByDay = async (req, res) => {
    // console.log("hello1")
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(200).json({ success: false, message: 'Start date and end date are required' });
    }

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        // console.log(start, end)
        end.setDate(end.getDate() + 1);
        const userCountByDay = await User.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: start,
                        $lte: end
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json(userCountByDay);
    } catch (error) {
        res.status(404).json({ success: false, message: 'Server error', error });
    }
};
const changePassword = async (req, res) => {
    let { currentPassword, newPassword } = req.body;
    const userId = req.params.id

    try {
        const user = await User.findById(userId);
        // console.log("user", user)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (!user.password && !currentPassword) {
            const hash = bcrypt.hashSync(newPassword, 10)
            await User.updateOne({ _id: userId }, { $set: { password: hash } });
            return res.status(200).json({ success: true, message: 'Password set successfully' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        const hash = bcrypt.hashSync(newPassword, 10)
        console.log(hash)
        await User.updateOne({ _id: userId }, { $set: { password: hash } });

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ success: false, message: 'không tồn tại user' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Set expiry time for token (e.g., 1 hour)
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + 3600);

        // Save reset token to the database
        await ResetPassword.create({
            email: user.email,
            token: resetToken,
            expiresAt,
        });

        // Send reset password email
        const emailResult = await sendEmailResetPassword.sendEmailResetPassword(email, resetToken);

        if (!emailResult.success) {
            return res.status(200).json({ success: false, message: emailResult.message });
        }

        return res.status(200).json({ success: true, message: 'Email đặt lại mật khẩu đã được gửi' });
    } catch (error) {
        console.error('Lỗi trong quá trình forgotPassword:', error);
        return res.status(404).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        console.log("toke", token, newPassword)
        // Tìm token đặt lại mật khẩu
        const resetPasswordRecord = await ResetPassword.findOne({ token: token });

        if (!resetPasswordRecord) {
            return res.status(200).json({ success: false, message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
        }

        // Kiểm tra token đã hết hạn chưa
        if (resetPasswordRecord.expiresAt < new Date()) {
            // Xóa token hết hạn khỏi cơ sở dữ liệu
            console.log("token het han")
            await ResetPassword.deleteOne({ _id: resetPasswordRecord._id });
            return res.status(200).json({ success: false, message: 'Reset token đã hết hạn' });
        }

        // Tìm người dùng bằng email
        const user = await User.findOne({ email: resetPasswordRecord.email });

        if (!user) {
            return res.status(200).json({ success: false, message: 'Không tồn tại user' });
        }

        // Cập nhật mật khẩu người dùng
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // Xóa token đặt lại mật khẩu khỏi cơ sở dữ liệu
        await ResetPassword.deleteOne({ _id: resetPasswordRecord._id });

        return res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(200).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};
module.exports = {
    createUser, loginUser, updateUser, deleteUser, getAllUser, getDetailsUser, refreshToken, logoutUser, deleteMany, getTotalUsers,
    getUserCountByDay, changePassword, forgotPassword, resetPassword
}