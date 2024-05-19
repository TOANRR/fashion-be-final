const express = require("express");
const router = express.Router()
const ChatBotController = require('../controllers/ChatBotController');

router.post('/webhook', ChatBotController.chatBot)


module.exports = router