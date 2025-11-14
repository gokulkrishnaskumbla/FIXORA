const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "listing",
        "plumbing",
        "cleaning",
        "electrical",
        "carpenter",
        "appliance",
        "saloon",
        "others",
      ],
      default: "others",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "ownerModel",
    },
    ownerModel: {
      type: String,
      enum: ["Provider", "Admin", "User"],
      default: "Provider",
    },
  },
  { timestamps: true }
);

const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);

module.exports = Service;
