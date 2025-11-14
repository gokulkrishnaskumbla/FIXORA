const express = require("express");
const router = express.Router();
const {
  createServiceRequest,
  getClientRequests,
  getServiceRequest,
  updateRequestStatus,
  confirmCompletion,
  cancelRequest,
  addRatingReview,
  getAvailableProviders,
} = require("../../Controllers/serviceRequestController");
const { authUser } = require("../../Middlewares/auth");

// Public route
router.get("/providers/:serviceId", getAvailableProviders);

// Protected routes
router.post("/create", authUser, createServiceRequest);
router.get("/my-requests", authUser, getClientRequests);
router.get("/:requestId", authUser, getServiceRequest);
router.put("/:requestId/status", authUser, updateRequestStatus);
router.put("/:requestId/confirm", authUser, confirmCompletion);
router.put("/:requestId/cancel", authUser, cancelRequest);
router.post("/:requestId/rating", authUser, addRatingReview);

module.exports = router;



