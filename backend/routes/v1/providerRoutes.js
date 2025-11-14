const express = require("express");
const router = express.Router();
const {
  registerProvider,
  getProviderProfile,
  updateProviderProfile,
  updateAvailability,
  getProviderRequests,
  acceptRequest,
  declineRequest,
  getProviderEarnings,
  getProviderStats,
  becomeProvider,
  createProviderService,
  getMyServices,
  updateProviderService,
  deleteProviderService,
  getProviderDashboard,
} = require("../../Controllers/providerController");
const { authUser, authAdmin } = require("../../Middlewares/auth");
const upload = require("../../Middlewares/multer");

// Public routes
router.post("/register", registerProvider);

// Protected routes (provider only)
router.get("/profile", authUser, getProviderProfile);
router.put("/profile", authUser, updateProviderProfile);
router.put("/availability", authUser, updateAvailability);
router.get("/requests", authUser, getProviderRequests);
router.put("/requests/:requestId/accept", authUser, acceptRequest);
router.put("/requests/:requestId/decline", authUser, declineRequest);
router.get("/earnings", authUser, getProviderEarnings);
router.get("/stats", authUser, getProviderStats);

// Become provider (existing user creates provider profile)
router.post("/become", authUser, becomeProvider);

// Provider service management
router.post("/services", authUser, upload.single("image"), createProviderService);
router.get("/services", authUser, getMyServices);
router.put("/services/:serviceId", authUser, upload.single("image"), updateProviderService);
router.delete("/services/:serviceId", authUser, deleteProviderService);

// Provider dashboard
router.get("/dashboard", authUser, getProviderDashboard);

module.exports = router;



