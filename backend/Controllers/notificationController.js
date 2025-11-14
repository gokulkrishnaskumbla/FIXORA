const Notification = require("../Models/notificationModel");
const Provider = require("../Models/providerModel");

// Get User Notifications
const getNotifications = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    const userModel = provider ? "Provider" : "User";

    const notifications = await Notification.find({
      user: req.user._id,
      userModel,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      userModel,
      isRead: false,
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark Notification as Read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark All as Read
const markAllAsRead = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    const userModel = provider ? "Provider" : "User";

    await Notification.updateMany(
      {
        user: req.user._id,
        userModel,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};



