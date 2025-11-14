const Stripe = require("stripe");
const Service = require("../Models/serviceModel");
const Cart = require("../Models/cartModel");
const Booking = require("../Models/bookingModel");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Existing PaymentIntent path (kept for backwards compatibility)
const createPaymentIntent = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const amount = Math.round(service.price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      description: `Payment for ${service.title}`,
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      serviceTitle: service.title,
      servicePrice: service.price,
    });
  } catch (error) {
    console.error("Stripe Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a Stripe Checkout Session from the user's cart and return the session URL
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user || req.user?._id;

    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const cart = await Cart.findOne({ userId }).populate({
      path: "services.serviceId",
      model: "Service",
    });

    if (!cart || !cart.services || cart.services.length === 0) {
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    const line_items = cart.services.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.serviceId?.title || "Service",
          description: item.serviceId?.description || undefined,
        },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: 1,
    }));

    const frontendBase = (process.env.FRONTEND_URL || "").trim().replace(/\/+$/, "");
    const successUrl = `${frontendBase}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendBase}/checkout/cancel`;

    // include optional preferred scheduling/address info in metadata
    const { preferredDate, preferredTime, address } = req.body || {};

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        cartId: cart._id.toString(),
        userId: userId.toString(),
        preferredDate: preferredDate || "",
        preferredTime: preferredTime || "",
        address: address ? JSON.stringify(address) : "",
      },
    });

    return res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("createCheckoutSession error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Verify a Stripe Checkout session (by session id), create bookings and clear cart
const verifyPayment = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) return res.status(400).json({ success: false, error: "sessionId required" });
    console.log("verifyPayment called for sessionId:", sessionId);

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
    } catch (stripeErr) {
      console.error("Stripe retrieve error for session", sessionId, stripeErr && stripeErr.message);
      return res.status(502).json({ success: false, error: "Failed to retrieve Stripe session", details: stripeErr && stripeErr.message });
    }

    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    // check if already processed
    const userFilter = req.user || session.metadata?.userId || null;
    const existing = await Booking.findOne({ stripeSessionId: session.id, user: userFilter });
    if (existing) {
      const bookings = await Booking.find({ stripeSessionId: session.id, user: userFilter }).populate("service", "title price");
      return res.status(200).json({ success: true, bookings });
    }

    if (!session.payment_status || session.payment_status !== "paid") {
      console.warn("Session payment not completed", { sessionId: session.id, payment_status: session.payment_status });
      return res.status(400).json({ success: false, error: "Payment not completed", payment_status: session.payment_status });
    }

    // Find cart by user metadata or session metadata
  const userId = (req.user && (req.user._id || req.user.id)) || session.metadata?.userId;
    const cartId = session.metadata?.cartId;

    let cart = null;
    if (cartId) cart = await Cart.findById(cartId).populate({ path: "services.serviceId", model: "Service" });
    if (!cart && userId) cart = await Cart.findOne({ userId }).populate({ path: "services.serviceId", model: "Service" });

    const createdBookings = [];

    if (cart && cart.services && cart.services.length > 0) {
      const ServiceRequest = require("../Models/serviceRequestModel");
      const Provider = require("../Models/providerModel");

      for (const item of cart.services) {
        const serviceId = item.serviceId._id || item.serviceId;

        // create booking record (keeps previous behavior)
        const booking = await Booking.create({
          user: userId,
          service: serviceId,
          bookingDate: new Date(),
          paymentMethod: "online",
          totalAmount: item.price || 0,
          status: "confirmed",
          paymentStatus: "paid",
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent?.id || session.payment_intent,
        });

        createdBookings.push(booking);

        // find provider for this service
        const provider = await Provider.findOne({ services: serviceId });

        if (!provider) {
          console.warn(`No provider found for service ${serviceId}. Skipping ServiceRequest creation.`);
          continue; // skip creating service request if no provider found
        }

        // parse scheduling/address metadata from session
        let preferredDateFromMeta = session.metadata?.preferredDate;
        let preferredTimeFromMeta = session.metadata?.preferredTime;
        let addressFromMeta = {};
        if (session.metadata?.address) {
          try {
            addressFromMeta = JSON.parse(session.metadata.address);
          } catch (err) {
            // if not JSON, store as fullAddress
            addressFromMeta = { fullAddress: session.metadata.address };
          }
        }

        // create a service request so provider sees it
        const newRequest = await ServiceRequest.create({
          client: userId,
          provider: provider._id,
          service: serviceId,
          requestDate: new Date(),
          preferredDate: preferredDateFromMeta ? new Date(preferredDateFromMeta) : new Date(),
          preferredTime: preferredTimeFromMeta || "",
          address: addressFromMeta || {},
          description: "",
          totalAmount: item.price || 0,
          status: "pending",
          providerResponse: "pending",
          paymentStatus: "paid",
          paymentMethod: "online",
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent?.id || session.payment_intent,
          payoutStatus: "pending",
        });

        // increment provider pending earnings
        provider.earnings = provider.earnings || { total: 0, pending: 0, paid: 0 };
        provider.earnings.pending = (provider.earnings.pending || 0) + (item.price || 0);
        await provider.save();

        // create notification for provider
        const Notification = require("../Models/notificationModel");
        await Notification.create({
          user: provider.user,
          userModel: "Provider",
          type: "request_received",
          title: "New Booking / Service Request",
          message: `You have a new booking for ${item.serviceId?.title || "a service"}`,
          relatedId: newRequest._id,
        });
      }

      // clear cart
      cart.services = [];
      cart.totalPrice = 0;
      await cart.save();
    }

    const bookings = await Booking.find({ stripeSessionId: session.id, user: userId }).populate("service", "title price");

    return res.status(200).json({ success: true, bookings: bookings.length > 0 ? bookings : createdBookings });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createPaymentIntent, createCheckoutSession, verifyPayment };
