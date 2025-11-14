const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    requestDate: {
      type: Date,
      required: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    providerResponse: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    declinedReason: {
      type: String,
      default: "",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      default: "online",
    },
    stripeSessionId: {
      type: String,
      sparse: true,
    },
    paymentIntentId: {
      type: String,
      sparse: true,
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
    clientRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    clientReview: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ServiceRequest || mongoose.model("ServiceRequest", serviceRequestSchema);

