const Provider = require("../Models/providerModel");
const User = require("../Models/userModel");
const ServiceRequest = require("../Models/serviceRequestModel");
const Review = require("../Models/reviewModel");
const Service = require("../Models/serviceModel");
const Booking = require("../Models/bookingModel");
const uploadToCloudinary = require("../Utilities/imageUpload");
const { hashPassword } = require("../Utilities/passwordUtilities");
const { createToken } = require("../Utilities/generateToken");

// Register as Service Provider
const registerProvider = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      businessName,
      services,
      experience,
      bio,
      address,
      serviceAreas,
      documents,
      availability,
    } = req.body;

    if (!name || !email || !phone || !password || !businessName) {
      return res.status(400).json({ error: "All required fields are missing" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user account
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    // Create provider profile
    const newProvider = new Provider({
      user: savedUser._id,
      businessName,
      services: services || [],
      experience: experience || 0,
      bio: bio || "",
      address: address || {},
      serviceAreas: serviceAreas || [],
      documents: documents || {},
      availability: availability || {
        isAvailable: true,
        workingHours: { start: "09:00", end: "18:00" },
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
      verificationStatus: "pending",
    });

    const savedProvider = await newProvider.save();

    const token = createToken(savedUser._id, "provider");
    const { password: pwd, ...userResponse } = savedUser._doc;

    res.status(201).json({
      success: true,
      message: "Provider registration successful. Awaiting verification.",
      token,
      role: "provider",
      provider: savedProvider,
      user: userResponse,
    });
  } catch (error) {
    console.error("Provider registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Provider Profile
const getProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id })
      .populate("user", "name email phone")
      .populate("services", "title description price image");

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    res.json({ success: true, provider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Provider Profile
const updateProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const updates = req.body;
    Object.assign(provider, updates);
    await provider.save();

    res.json({ success: true, message: "Profile updated successfully", provider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Availability
const updateAvailability = async (req, res) => {
  try {
    const { isAvailable, workingHours, workingDays } = req.body;
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    provider.availability = {
      isAvailable: isAvailable !== undefined ? isAvailable : provider.availability.isAvailable,
      workingHours: workingHours || provider.availability.workingHours,
      workingDays: workingDays || provider.availability.workingDays,
    };

    await provider.save();

    res.json({ success: true, message: "Availability updated", availability: provider.availability });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Service Requests for Provider
const getProviderRequests = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const requests = await ServiceRequest.find({ provider: provider._id })
      .populate("client", "name email phone")
      .populate("service", "title description price image")
      .sort({ createdAt: -1 });

    // Also include any Bookings made for this provider's services (treat them as requests for provider visibility)
    let bookingRequests = [];
    try {
      const bookings = await Booking.find({ service: { $in: provider.services || [] } })
        .populate("user", "name email phone")
        .populate("service", "title description price image duration")
        .sort({ createdAt: -1 });

      bookingRequests = bookings.map((b) => ({
        _id: `booking-${b._id}`,
        client: b.user,
        service: b.service,
        requestDate: b.createdAt,
        preferredDate: b.bookingDate,
        preferredTime: b.preferredTime || "",
        address: b.address || {},
        description: b.description || "",
        totalAmount: b.totalAmount || (b.service && b.service.price) || 0,
        status: b.status || "pending",
        isBooking: true,
        originalBookingId: b._id,
      }));
    } catch (err) {
      console.error("Error fetching related bookings for provider requests:", err.message || err);
    }

    const combined = [...requests, ...bookingRequests].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    // Debug: log provider and counts
    console.log(`getProviderRequests: provider=${provider ? provider._id : 'null'}, serviceRequests=${requests.length}, bookingRequests=${bookingRequests.length}, combined=${combined.length}`);

    res.json({ success: true, requests: combined });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept Service Request
const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
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

    request.status = "accepted";
    request.providerResponse = "accepted";
    await request.save();

    // Create notification for client
    const Notification = require("../Models/notificationModel");
    await Notification.create({
      user: request.client,
      userModel: "User",
      type: "request_accepted",
      title: "Request Accepted",
      message: `Your service request has been accepted by ${provider.businessName}`,
      relatedId: request._id,
    });

    res.json({ success: true, message: "Request accepted", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Decline Service Request
const declineRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
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

    // If payment was made, refund the client and adjust provider earnings
    if (request.paymentStatus === "paid" && request.payoutStatus !== "refunded") {
      try {
        const Stripe = require("stripe");
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        if (request.paymentIntentId) {
          await stripe.refunds.create({ payment_intent: request.paymentIntentId });
        } else if (request.stripeSessionId) {
          const session = await stripe.checkout.sessions.retrieve(request.stripeSessionId, { expand: ["payment_intent"] });
          const pi = session.payment_intent?.id || session.payment_intent;
          if (pi) await stripe.refunds.create({ payment_intent: pi });
        }

        request.paymentStatus = "refunded";
        request.payoutStatus = "refunded";

        provider.earnings = provider.earnings || { total: 0, pending: 0, paid: 0 };
        provider.earnings.pending = Math.max(0, (provider.earnings.pending || 0) - (request.totalAmount || 0));
        await provider.save();
      } catch (refundErr) {
        console.error("Refund during decline failed:", refundErr);
        // continue, but mark decline
      }
    }

    request.status = "declined";
    request.providerResponse = "declined";
    request.declinedReason = reason || "";
    await request.save();

    // Create notification for client
    const Notification = require("../Models/notificationModel");
    await Notification.create({
      user: request.client,
      userModel: "User",
      type: "request_declined",
      title: "Request Declined",
      message: `Your service request has been declined by ${provider.businessName}`,
      relatedId: request._id,
    });

    res.json({ success: true, message: "Request declined", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Provider Earnings
const getProviderEarnings = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const completedRequests = await ServiceRequest.find({
      provider: provider._id,
      status: "completed",
      paymentStatus: "paid",
    });

    const totalEarnings = completedRequests.reduce((sum, req) => sum + (req.totalAmount || 0), 0);
    const pendingEarnings = await ServiceRequest.find({
      provider: provider._id,
      status: "completed",
      paymentStatus: "pending",
    });

    const pendingAmount = pendingEarnings.reduce((sum, req) => sum + (req.totalAmount || 0), 0);

    res.json({
      success: true,
      earnings: {
        total: totalEarnings,
        pending: pendingAmount,
        paid: totalEarnings - pendingAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Provider Statistics
const getProviderStats = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const totalRequests = await ServiceRequest.countDocuments({ provider: provider._id });
    const acceptedRequests = await ServiceRequest.countDocuments({
      provider: provider._id,
      status: "accepted",
    });
    const completedRequests = await ServiceRequest.countDocuments({
      provider: provider._id,
      status: "completed",
    });
    const pendingRequests = await ServiceRequest.countDocuments({
      provider: provider._id,
      status: "pending",
    });

    const reviews = await Review.find({ service: { $in: provider.services } });
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      stats: {
        totalRequests,
        acceptedRequests,
        completedRequests,
        pendingRequests,
        averageRating: averageRating.toFixed(1),
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Become provider (upgrade existing user to provider by creating Provider profile)
const becomeProvider = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user;

    // Check existing provider
    const existing = await Provider.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({ error: "Provider profile already exists" });
    }

    const { businessName, bio, address, serviceAreas, documents } = req.body;

    const newProvider = new Provider({
      user: userId,
      businessName: businessName || undefined,
      bio: bio || "",
      address: address || {},
      serviceAreas: serviceAreas || [],
      documents: documents || {},
      verificationStatus: "pending",
    });

    const savedProvider = await newProvider.save();

    const user = await User.findById(userId).select("-password");
    const token = createToken(userId, "provider");

    res.status(201).json({ success: true, message: "Provider profile created", token, role: "provider", provider: savedProvider, user });
  } catch (error) {
    console.error("Become provider error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Provider creates a service and links to their provider profile
const createProviderService = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const provider = await Provider.findOne({ user: userId });
    if (!provider) return res.status(404).json({ error: "Provider profile not found" });

    const { title, description, duration, price, category } = req.body;
    if (!title || !description || !duration || !price) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let imageUrl = null;
    if (req.file) {
      const uploadRes = await uploadToCloudinary(req.file.path);
      imageUrl = uploadRes;
    }

  const newService = new Service({ title, description, duration, price, category: category || 'others', image: imageUrl || "", owner: provider._id, ownerModel: 'Provider' });
    const saved = await newService.save();

    provider.services = provider.services || [];
    provider.services.push(saved._id);
    await provider.save();

    res.status(201).json({ success: true, message: "Service added", service: saved });
  } catch (error) {
    console.error("Create provider service error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getMyServices = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const provider = await Provider.findOne({ user: userId }).populate('services');
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    res.json({ success: true, services: provider.services || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProviderDashboard = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const provider = await Provider.findOne({ user: userId }).populate('services');
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });

    const upcoming = await ServiceRequest.find({ provider: provider._id, status: { $in: ['accepted', 'pending'] } })
      .populate('client', 'name email')
      .populate('service', 'title price')
      .sort({ createdAt: -1 })
      .limit(10);

    const completedRequests = await ServiceRequest.find({ provider: provider._id, status: 'completed', paymentStatus: 'paid' });
    const totalEarnings = completedRequests.reduce((s, r) => s + (r.totalAmount || 0), 0);

    const stats = {
      totalServices: (provider.services || []).length,
      totalEarnings,
    };

    res.json({ success: true, upcoming, services: provider.services, earnings: { total: totalEarnings }, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update provider-owned service
const updateProviderService = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const provider = await Provider.findOne({ user: userId });
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });

    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.owner && service.owner.toString() !== provider._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, duration, price, category } = req.body;
    let imageUrl;
    if (req.file) {
      const uploadRes = await uploadToCloudinary(req.file.path);
      imageUrl = uploadRes;
    }

    const updatePayload = {};
    if (title) updatePayload.title = title;
    if (description) updatePayload.description = description;
    if (duration) updatePayload.duration = duration;
    if (price) updatePayload.price = price;
    if (category) updatePayload.category = category;
    if (imageUrl) updatePayload.image = imageUrl;

    const updated = await Service.findByIdAndUpdate(serviceId, updatePayload, { new: true });
    res.json({ success: true, message: 'Service updated', service: updated });
  } catch (error) {
    console.error('Update provider service error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete provider-owned service
const deleteProviderService = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user;
    const provider = await Provider.findOne({ user: userId });
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });

    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.owner && service.owner.toString() !== provider._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Service.findByIdAndDelete(serviceId);

    // Remove from provider.services array if present
    provider.services = (provider.services || []).filter((id) => id.toString() !== serviceId.toString());
    await provider.save();

    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    console.error('Delete provider service error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerProvider,
  getProviderProfile,
  updateProviderProfile,
  updateAvailability,
  getProviderRequests,
  acceptRequest,
  declineRequest,
  getProviderEarnings,
  getProviderStats,
  // newly added
  becomeProvider,
  createProviderService,
  getMyServices,
  getProviderDashboard,
  updateProviderService,
  deleteProviderService,
};

