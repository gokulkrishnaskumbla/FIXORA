const Booking = require("../Models/bookingModel");
const ServiceRequest = require("../Models/serviceRequestModel");
const Provider = require("../Models/providerModel");

const createBooking = async (req, res) => {
  try {
    const { service, bookingDate, paymentMethod, totalAmount } = req.body;

    const newBooking = await Booking.create({
      user: req.user._id,
      service,
      bookingDate,
      paymentMethod,
      totalAmount,
    });

    // After creating a booking, create a ServiceRequest for the provider who owns this service
    try {
      const provider = await Provider.findOne({ services: service });
      if (provider) {
        const sr = new ServiceRequest({
          client: req.user._id,
          provider: provider._id,
          service,
          requestDate: new Date(),
          preferredDate: bookingDate || new Date(),
          preferredTime: req.body.preferredTime || "ASAP",
          address: req.body.address || {},
          description: req.body.description || "",
          totalAmount: totalAmount,
          status: "pending",
          providerResponse: "pending",
        });
        await sr.save();

        // notify provider
        const Notification = require("../Models/notificationModel");
        await Notification.create({
          user: provider.user,
          userModel: "Provider",
          type: "request_received",
          title: "New Booking Request",
          message: `You have a new booking for service ${service}`,
          relatedId: sr._id,
        });
      }
    } catch (err) {
      console.error("Failed to create service request from booking:", err.message || err);
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate("service", "title description price image")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get logged-in user's bookings
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("service", "title description price image duration")
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user._id.toString() && req.userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a booking as completed (allows client to confirm completion for legacy bookings)
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user._id.toString() && req.userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status === "cancelled") return res.status(400).json({ message: "Cannot complete a cancelled booking" });

    booking.status = "completed";
    await booking.save();

    // If payment was made, settle provider earnings similar to service requests
    if (booking.paymentStatus === "paid") {
      const Provider = require("../Models/providerModel");
      const provider = await Provider.findOne({ services: booking.service });
      if (provider) {
        provider.earnings = provider.earnings || { total: 0, pending: 0, paid: 0 };
        provider.earnings.pending = Math.max(0, (provider.earnings.pending || 0) - (booking.totalAmount || 0));
        provider.earnings.paid = (provider.earnings.paid || 0) + (booking.totalAmount || 0);
        provider.earnings.total = (provider.earnings.total || 0) + (booking.totalAmount || 0);
        await provider.save();
      }

      const Notification = require("../Models/notificationModel");
      await Notification.create({
        user: provider ? provider.user : booking.user,
        userModel: provider ? "Provider" : "User",
        type: "request_completed",
        title: "Booking Completed",
        message: `Client has confirmed completion for booking ${booking._id}`,
        relatedId: booking._id,
      });
    }

    res.json({ success: true, message: "Booking marked as completed", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Provider accepts a booking for their service
const providerAcceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(403).json({ message: "Unauthorized" });

    // Ensure provider owns the booked service
    if (!provider.services || !provider.services.map(String).includes(booking.service.toString())) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot accept this booking' });
    }

    booking.status = 'confirmed';
    await booking.save();

    // Notify client
    const Notification = require("../Models/notificationModel");
    await Notification.create({
      user: booking.user,
      userModel: 'User',
      type: 'booking_accepted',
      title: 'Booking Accepted',
      message: `Your booking ${booking._id} has been accepted by the provider.`,
      relatedId: booking._id,
    });

    res.json({ success: true, message: 'Booking accepted', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Provider cancels a booking for their service
const providerCancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(403).json({ message: "Unauthorized" });

    if (!provider.services || !provider.services.map(String).includes(booking.service.toString())) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Notify client
    const Notification = require("../Models/notificationModel");
    await Notification.create({
      user: booking.user,
      userModel: 'User',
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Your booking ${booking._id} has been cancelled by the provider.`,
      relatedId: booking._id,
    });

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getUserBookings,
  cancelBooking,
  completeBooking,
  providerAcceptBooking,
  providerCancelBooking,
};
