const express = require("express");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
dotenv.config()
require('./passport')
const app = express()

console.log(`${process.env.MONGO_DB}`)
const port = process.env.PORT || 3001
app.get('/', (req, res) => {
    res.send('Hello world')
})

app.use(cors())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(bodyParser.json())
app.use(cookieParser())

routes(app);
mongoose.connect(`${process.env.MONGO_DB}`)
    .then(() => {
        console.log("connect success")
    })
    .catch((err) => {
        console.log(err)
    })
console.log("client_id", process.env.CLIENT_ID)
app.listen(port, () => {
    console.log("server's port running:", + port)
})