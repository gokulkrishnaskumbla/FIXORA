const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../../Controllers/notificationController");
const { authUser } = require("../../Middlewares/auth");

router.get("/", authUser, getNotifications);
router.put("/:notificationId/read", authUser, markAsRead);
router.put("/read-all", authUser, markAllAsRead);

module.exports = router;



