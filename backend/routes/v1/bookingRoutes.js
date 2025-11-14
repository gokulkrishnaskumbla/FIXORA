const express = require("express");
const router = express.Router();




const { createBooking, getAllBookings, getUserBookings, cancelBooking, completeBooking } = require("../../Controllers/bookingController");
const { providerAcceptBooking, providerCancelBooking } = require("../../Controllers/bookingController");
const { authUser, authAdmin, authUserOrAdmin } = require("../../Middlewares/auth");

router.post("/create", authUser, createBooking);

router.get("/all-bookings", authAdmin, getAllBookings); // Admin only

router.get("/my-bookings", authUser, getUserBookings);

router.put("/cancel/:id", authUserOrAdmin, cancelBooking); // User can cancel their own, admin can cancel any
router.put("/complete/:id", authUser, completeBooking); // User confirms completion for legacy booking
router.put("/provider/accept/:id", authUser, providerAcceptBooking); // Provider accepts booking
router.put("/provider/cancel/:id", authUser, providerCancelBooking); // Provider cancels booking

module.exports = router;
