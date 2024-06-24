const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const authMiddleWare = (req, res, next) => {
    // console.log(req.headers.token)
    const token = req.headers.token.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: 'The authemtication',
                status: 'ERROR'
            })
        }
        if (user?.isAdmin) {
            next()
        } else {
            return res.status(404).json({
                message: 'The authemtication',
                status: 'ERROR'
            })
        }
    });
}
const authUserMiddleWare = (req, res, next) => {
    // console.log("token:", req.headers)
    const token = req.headers.token.split(' ')[1]
    //  console.log("token:",token)
    const userId = req.params.id
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: 'The authemtication 1',
                status: 'ERROR'
            })
        }
        if (user?.isAdmin || user?.id === userId) {
            next()
        } else {
            console.log(user?.id, userId)
            return res.status(404).json({
                message: 'The authemtication 2',
                status: 'ERROR'
            })
        }
    });
}
const authUser2MiddleWare = (req, res, next) => {
    // console.log("token:", req.headers)
    const token = req.headers.token.split(' ')[1]
    //  console.log("token:",token)
    const userId = req.params.id
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: 'The authemtication 1',
                status: 'ERROR'
            })
        }
        if (user?.id) {
            next()
        } else {
            return res.status(404).json({
                message: 'The authemtication',
                status: 'ERROR'
            })
        }

    });
}
module.exports = {
    authMiddleWare, authUserMiddleWare, authUser2MiddleWare
}