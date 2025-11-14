const adminRouter = require('./adminRoutes');
const serviceRouter = require('./serviceRoutes');
const userRouter = require('./userRoutes');
const paymentRouter = require('./paymentRoutes');
const bookingRouter = require('./bookingRoutes');
const contactRouter = require('./contactRoutes');
const reviewRouter = require('./reviewRoutes');
const cartRouter = require('./cartRoutes');
const providerRouter = require('./providerRoutes');
const serviceRequestRouter = require('./serviceRequestRoutes');
const messageRouter = require('./messageRoutes');
const notificationRouter = require('./notificationRoutes');
const debugRouter = require('./debugRoutes');

const v1Router = require('express').Router();

v1Router.use("/user", userRouter);
v1Router.use("/admin", adminRouter);
v1Router.use("/service", serviceRouter);
v1Router.use("/payment", paymentRouter);
v1Router.use("/bookings", bookingRouter);
v1Router.use("/contact", contactRouter);
v1Router.use("/review", reviewRouter);
v1Router.use("/cart", cartRouter);
v1Router.use("/provider", providerRouter);
v1Router.use("/service-request", serviceRequestRouter);
v1Router.use("/message", messageRouter);
v1Router.use("/notification", notificationRouter);
v1Router.use("/debug", debugRouter);

module.exports = v1Router;
