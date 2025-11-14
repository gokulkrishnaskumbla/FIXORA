const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    experience: {
      type: Number,
      required: true,
      default: 0,
    },
    bio: {
      type: String,
      default: "",
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: "India",
      },
    },
    serviceAreas: [
      {
        type: String,
      },
    ],
    documents: {
      aadhar: {
        number: String,
        document: String, // URL to uploaded document
      },
      pan: {
        number: String,
        document: String,
      },
      license: {
        number: String,
        document: String,
      },
      otherDocuments: [
        {
          name: String,
          document: String,
        },
      ],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationNotes: {
      type: String,
      default: "",
    },
    availability: {
      isAvailable: {
        type: Boolean,
        default: true,
      },
      workingHours: {
        start: String, // e.g., "09:00"
        end: String, // e.g., "18:00"
      },
      workingDays: [
        {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        },
      ],
    },
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    earnings: {
      total: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
      paid: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Provider || mongoose.model("Provider", providerSchema);

