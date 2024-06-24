const router = require('express').Router()
const passport = require('passport')
require('dotenv').config()
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// router.get('/google/callback', (req, res, next) => {
//     passport.authenticate('google', (err, profile) => {
//         req.user = profile
//         console.log("pro", profile)
//         next()
//     })(req, res, next)
// }, (req, res) => {
//     console.log(process.env.URL_CLIENT)
//     res.redirect(`${process.env.URL_CLIENT}/`)
// })
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    const { accessToken, refreshToken, id } = req.user;
    console.log(id)
    if (id) {
        console.log('here')
        res.redirect(`${process.env.URL_CLIENT}/login-success?accessToken=${accessToken}&refreshToken=${refreshToken}&id=${id}`);

    }
    // Chuyển hướng người dùng và gửi JWT trong URL
    else {
        res.redirect(`${process.env.URL_CLIENT}/login-success?accessToken=${accessToken}&refreshToken=${refreshToken}`);

    }
});





// router.post('/login-success', authController.loginSuccess)



module.exports = router