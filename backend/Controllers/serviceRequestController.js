const Stripe = require("stripe");
const ServiceRequest = require("../Models/serviceRequestModel");
const Provider = require("../Models/providerModel");
const Service = require("../Models/serviceModel");
const Notification = require("../Models/notificationModel");
require("dotenv").config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Service Request
const createServiceRequest = async (req, res) => {
  try {
    const {
      providerId,
      serviceId,
      preferredDate,
      preferredTime,
      address,
      description,
    } = req.body;

    if (!providerId || !serviceId || !preferredDate || !preferredTime) {
      return res.status(400).json({ error: "All required fields are missing" });
    }

    // Verify provider exists and is verified
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    if (provider.verificationStatus !== "verified") {
      return res.status(400).json({ error: "Provider is not verified" });
    }

    if (!provider.availability.isAvailable) {
      return res.status(400).json({ error: "Provider is currently unavailable" });
    }

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Create service request
    const newRequest = new ServiceRequest({
      client: req.user._id,
      provider: providerId,
      service: serviceId,
      requestDate: new Date(),
      preferredDate,
      preferredTime,
      address: address || {},
      description: description || "",
      totalAmount: service.price,
      status: "pending",
      providerResponse: "pending",
    });

    const savedRequest = await newRequest.save();

    // Create notification for provider
    await Notification.create({
      user: provider.user,
      userModel: "Provider",
      type: "request_received",
      title: "New Service Request",
      message: `You have received a new service request for ${service.title}`,
      relatedId: savedRequest._id,
    });

    res.status(201).json({
      success: true,
      message: "Service request created successfully",
      request: savedRequest,
    });
  } catch (error) {
    console.error("Service request error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Client Service Requests
const getClientRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ client: req.user._id })
      .populate("provider", "businessName")
      .populate("service", "title description price image")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Single Service Request
const getServiceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ServiceRequest.findById(requestId)
      .populate("client", "name email phone")
      .populate("provider", "businessName")
      .populate("service", "title description price image");

    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    // Check authorization
    const provider = await Provider.findOne({ user: req.user._id });
    if (
      request.client.toString() !== req.user._id.toString() &&
      (!provider || request.provider.toString() !== provider._id.toString())
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Request Status (for providers)
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    if (request.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    request.status = status;
    if (status === "completed") {
      request.completedAt = new Date();

      // If payment was made and payout is pending, settle to provider earnings
      if (request.paymentStatus === "paid" && request.payoutStatus !== "paid") {
        const provider = await Provider.findById(request.provider);
        if (provider) {
          provider.earnings = provider.earnings || { total: 0, pending: 0, paid: 0 };
          // reduce pending and increase paid & total
          provider.earnings.pending = Math.max(0, (provider.earnings.pending || 0) - (request.totalAmount || 0));
          provider.earnings.paid = (provider.earnings.paid || 0) + (request.totalAmount || 0);
          provider.earnings.total = (provider.earnings.total || 0) + (request.totalAmount || 0);
          await provider.save();

          request.payoutStatus = "paid";
        }
      }
    }

    await request.save();

    // Create notification
    await Notification.create({
      user: request.client,
      userModel: "User",
      type: status === "completed" ? "request_completed" : "request_updated",
      title: status === "completed" ? "Service Completed" : "Request Updated",
      message: status === "completed" ? `Your service request has been marked as completed` : `Your service request status changed to ${status}`,
      relatedId: request._id,
    });

    res.json({ success: true, message: "Request status updated", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel Service Request
const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ServiceRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    // Check if user is the client
    if (request.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (request.status === "completed" || request.status === "cancelled") {
      return res.status(400).json({ error: "Cannot cancel this request" });
    }

    // If payment was done and payout is pending or paid, refund the user
    if (request.paymentStatus === "paid" && request.payoutStatus !== "refunded") {
      try {
        // Attempt refund using paymentIntentId if available
        if (request.paymentIntentId) {
          await stripe.refunds.create({ payment_intent: request.paymentIntentId });
        } else if (request.stripeSessionId) {
          // fallback: retrieve session and refund its payment_intent
          const session = await stripe.checkout.sessions.retrieve(request.stripeSessionId, { expand: ["payment_intent"] });
          const pi = session.payment_intent?.id || session.payment_intent;
          if (pi) await stripe.refunds.create({ payment_intent: pi });
        }
        request.paymentStatus = "refunded";
        request.payoutStatus = "refunded";

        // adjust provider pending/paid amounts
        const provider = await Provider.findById(request.provider);
        if (provider) {
          provider.earnings = provider.earnings || { total: 0, pending: 0, paid: 0 };
          provider.earnings.pending = Math.max(0, (provider.earnings.pending || 0) - (request.totalAmount || 0));
          await provider.save();
        }
      } catch (refundErr) {
        console.error("Refund failed:", refundErr);
        // continue with cancellation even if refund fails; surface warning
      }
    }

    request.status = "cancelled";
    await request.save();

    res.json({ success: true, message: "Request cancelled", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Rating and Review
const addRatingReview = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rating, review } = req.body;

    const request = await ServiceRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    if (request.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (request.status !== "completed") {
      return res.status(400).json({ error: "Service must be completed before rating" });
    }

    request.clientRating = rating;
    request.clientReview = review;
    await request.save();

    // Update provider rating
    const provider = await Provider.findById(request.provider);
    if (provider) {
      const allRatings = await ServiceRequest.find({
        provider: provider._id,
        clientRating: { $exists: true },
      });

      const totalRating = allRatings.reduce((sum, r) => sum + (r.clientRating || 0), 0);
      provider.rating.average = totalRating / allRatings.length;
      provider.rating.count = allRatings.length;
      await provider.save();
    }

    res.json({ success: true, message: "Rating and review added", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Client confirms completion (allows client to mark the service as completed)
const confirmCompletion = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: "Service request not found" });

    if (request.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (request.status === "cancelled") {
      return res.status(400).json({ error: "Cannot confirm a cancelled request" });
    }

    request.status = "completed";
    request.completedAt = new Date();

    // settle payout if paid and pending
    if (request.paymentStatus === "paid" && request.payoutStatus !== "paid") {
      const provider = await Provider.findById(request.provider);
      if (provider) {
        provider.earnings = provider.earnings || { total: 0, pending: 0, paid: 0 };
        provider.earnings.pending = Math.max(0, (provider.earnings.pending || 0) - (request.totalAmount || 0));
        provider.earnings.paid = (provider.earnings.paid || 0) + (request.totalAmount || 0);
        provider.earnings.total = (provider.earnings.total || 0) + (request.totalAmount || 0);
        await provider.save();

        request.payoutStatus = "paid";
      }
    }

    await request.save();

    await Notification.create({
      user: request.provider,
      userModel: "Provider",
      type: "request_completed",
      title: "Request Completed",
      message: `Client has confirmed completion for request ${request._id}`,
      relatedId: request._id,
    });

    res.json({ success: true, message: "Request confirmed completed", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Available Providers for a Service
const getAvailableProviders = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const providers = await Provider.find({
      services: serviceId,
      verificationStatus: "verified",
      isActive: true,
      "availability.isAvailable": true,
    })
      .populate("user", "name email phone")
      .populate("services", "title")
      .select("-documents");

    res.json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createServiceRequest,
  getClientRequests,
  getServiceRequest,
  updateRequestStatus,
  cancelRequest,
  addRatingReview,
  getAvailableProviders,
  confirmCompletion,
};



