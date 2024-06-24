const UserRouter = require('./UserRouter')
const ProductRouter = require('./ProductRouter')
const OrderRouter = require('./OrderRouter')
const PaymentRouter = require('./PaymentRouter')
const CardRouter = require('./CardRouter')
const VnpayRouter = require('./VnpayRouter')
const routes = (app) => {
    app.use('/api/user', UserRouter),
        app.use('/api/product', ProductRouter),
        app.use('/api/order', OrderRouter),
        app.use('/api/payment', PaymentRouter),
        app.use('/api/card', CardRouter),
        app.use('/api/vnpay', VnpayRouter)
}
module.exports = routes