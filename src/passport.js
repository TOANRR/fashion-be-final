const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config()
const jwt = require('jsonwebtoken')

const passport = require('passport');
const User = require('./models/UserModel');
const { genneralAccessToken, genneralRefreshToken } = require('./services/jwtService');
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID_GG,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Tìm kiếm người dùng bằng email từ thông tin profile
            const existingUser = await User.findOne({ email: profile._json.email });

            if (existingUser) {
                // Nếu người dùng đã tồn tại, cập nhật Google ID (nếu cần)
                if (!existingUser.googleID) {
                    existingUser.googleID = profile.id;
                    await existingUser.save();
                }
                // Tạo và gửi JWT cho người dùng
                const accessToken = await genneralAccessToken({
                    id: existingUser.id,
                    isAdmin: existingUser.isAdmin
                })
                const refreshToken = await genneralRefreshToken({
                    id: existingUser.id,
                    isAdmin: existingUser.isAdmin
                })
                return done(null, { accessToken, refreshToken, id: existingUser.id });
            } else {
                // Nếu người dùng chưa tồn tại, tạo mới người dùng
                const newUser = new User({
                    googleID: profile.id,
                    email: profile._json.email,
                    avatar: profile._json.picture,
                    name: profile._json.name
                    // Các thông tin khác từ profile có thể được lấy và lưu vào đây
                });
                await newUser.save();
                // Tạo và gửi JWT cho người dùng mới
                const accessToken = await genneralAccessToken({
                    id: newUser.id,
                    isAdmin: newUser.isAdmin
                })
                const refreshToken = await genneralRefreshToken({
                    id: newUser.id,
                    isAdmin: newUser.isAdmin
                })
                return done(null, { accessToken, refreshToken });
            }
        } catch (error) {
            return done(error, null);
        }
    }));
