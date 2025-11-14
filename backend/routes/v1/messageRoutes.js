const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, getConversations } = require("../../Controllers/messageController");
const { authUser } = require("../../Middlewares/auth");

router.post("/send", authUser, sendMessage);
router.get("/request/:requestId", authUser, getMessages);
router.get("/conversations", authUser, getConversations);

module.exports = router;



