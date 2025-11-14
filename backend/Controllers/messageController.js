const mongoose = require("mongoose");
const Message = require("../Models/messageModel");
const ServiceRequest = require("../Models/serviceRequestModel");
const Notification = require("../Models/notificationModel");
const Provider = require("../Models/providerModel");

// 🔹 Helper: Find provider for user
async function getProviderForUser(userId) {
  return await Provider.findOne({ user: userId });
}

// 📨 Send Message
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, serviceRequestId, message, attachments, receiverModel } = req.body;

    if (!receiverId || !serviceRequestId || !message) {
      return res.status(400).json({ error: "receiverId, serviceRequestId, and message are required" });
    }

    const request = await ServiceRequest.findById(serviceRequestId);
    if (!request) return res.status(404).json({ error: "Service Request not found" });

    const provider = await getProviderForUser(senderId);
    const senderModel = provider ? "Provider" : "User";
    const receiverType = receiverModel || (senderModel === "Provider" ? "User" : "Provider");

    // ✅ Create new message
    const newMessage = await Message.create({
      sender: senderId,
      senderModel,
      receiver: receiverId,
      receiverModel: receiverType,
      serviceRequest: serviceRequestId,
      message,
      attachments: attachments || [],
    });

    // 🔔 Create notification for receiver
    await Notification.create({
      user: receiverId,
      userModel: receiverType,
      type: "message_received",
      title: "New Message",
      message: message.substring(0, 120),
      relatedId: newMessage._id,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 💬 Get Messages for a Service Request
const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    if (!requestId) return res.status(400).json({ error: "requestId is required" });

    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: "Service Request not found" });

    const provider = await getProviderForUser(userId);
    const isClient = String(request.client) === String(userId);
    const isProvider = provider && String(request.provider) === String(provider._id);

    if (!isClient && !isProvider) {
      return res.status(403).json({ error: "Unauthorized to view messages for this request" });
    }

    const messages = await Message.find({ serviceRequest: requestId })
      .sort({ createdAt: 1 })
      .populate("sender", "name email");

    // ✅ Mark messages as read
    await Message.updateMany(
      { serviceRequest: requestId, receiver: userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 💬 Get All Conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const provider = await getProviderForUser(userId);

    const requests = provider
      ? await ServiceRequest.find({ provider: provider._id }).populate("service", "title client provider status createdAt")
      : await ServiceRequest.find({ client: userId }).populate("service", "title client provider status createdAt");

    const conversations = await Promise.all(
      requests.map(async (reqDoc) => {
        const lastMessage = await Message.findOne({ serviceRequest: reqDoc._id })
          .sort({ createdAt: -1 })
          .populate("sender", "name");

        const unreadCount = await Message.countDocuments({
          serviceRequest: reqDoc._id,
          receiver: userId,
          isRead: false,
        });

        // determine other participant relative to current user
        const other = provider
          ? { id: reqDoc.client, model: "User" }
          : { id: reqDoc.provider, model: "Provider" };

        return {
          requestId: reqDoc._id,
          service: reqDoc.service,
          status: reqDoc.status,
          lastMessage: { message: lastMessage?.message || "", createdAt: lastMessage?.createdAt || reqDoc.createdAt },
          lastMessageTime: lastMessage?.createdAt || reqDoc.createdAt,
          unreadCount,
          otherParticipant: other,
        };
      })
    );

    res.json({ success: true, conversations });
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
};
