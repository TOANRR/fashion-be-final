const UserRouter = require('./UserRouter')
const ProductRouter = require('./ProductRouter')
const OrderRouter = require('./OrderRouter')
const PaymentRouter = require('./PaymentRouter')
const CardRouter = require('./CardRouter')
const VnpayRouter = require('./VnpayRouter')
const ReviewRouter = require('./ReviewRouter')
const authRouter = require('./AuthGoogleRouter')
const dashBoardRouter = require('./DashBoardRouter')
const chatbotRouter = require('./ChatBotRouter')
const articleRouter = require('./ArticleRouter')
const routes = (app) => {
    app.use('/api/user', UserRouter),
        app.use('/api/product', ProductRouter),
        app.use('/api/order', OrderRouter),
        app.use('/api/payment', PaymentRouter),
        app.use('/api/card', CardRouter),
        app.use('/api/vnpay', VnpayRouter),
        app.use('/api/review', ReviewRouter),
        app.use('/api/auth', authRouter),
        app.use('/api/dashboard', dashBoardRouter),
        app.use('/api/chatbot', chatbotRouter),
        app.use('/api/article', articleRouter)


}
module.exports = routes