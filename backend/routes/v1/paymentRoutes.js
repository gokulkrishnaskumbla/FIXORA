const express = require("express");
const { createPaymentIntent, createCheckoutSession, verifyPayment } = require("../../Controllers/paymentController");
const authUser = require("../../Middlewares/authUser");
const router = express.Router();


router.post("/create-payment-intent", authUser, createPaymentIntent);
router.post("/create-checkout-session", authUser, createCheckoutSession);
router.get("/verify-payment/:sessionId", authUser, verifyPayment);

module.exports = router;
