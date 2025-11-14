import { axiosInstance } from "../axios/axiosinstance";

export const listServices = () => {
  return axiosInstance.get("/service/listservices");
};

// List services by category (e.g. plumbing, cleaning, electrical, carpenter, appliance, saloon, others)
export const listServicesByCategory = (category) => {
  return axiosInstance.get(`/service/listservices?category=${encodeURIComponent(category)}`);
};

export const getServiceDetails = (serviceId) => {
  return axiosInstance.get(`/service/serviceDetails/${serviceId}`);
};

export const userSignUp = (data) => {
  return axiosInstance.post("/user/register", data);
};

export const userLogin = (data) => {
  return axiosInstance.post("/user/login", data);
};

export const userLogout = () => {
  return axiosInstance.post("/user/logout");
};

export const addToCart = (serviceId) => {
  return axiosInstance.post(`/cart/addtocart/${serviceId}`);
};

export const getCartItems = () => {
  return axiosInstance.get("/cart/mycart");
};

export const removeFromCart = (serviceId) => {
  return axiosInstance.delete(`/cart/remove/${serviceId}`);
};

export const clearCart = () => {
  return axiosInstance.delete("/cart/clear");
};

// Create Stripe Checkout Session
export const createCheckoutSession = (payload = {}) => {
  return axiosInstance.post("/payment/create-checkout-session", payload);
};

// Verify Payment
export const verifyPayment = (sessionId) => {
  return axiosInstance.get(`/payment/verify-payment/${sessionId}`);
};

// Get User Bookings
export const getUserBookings = () => {
  return axiosInstance.get("/bookings/my-bookings");
};

// Cancel Booking
export const cancelBooking = (bookingId) => {
  return axiosInstance.put(`/bookings/cancel/${bookingId}`);
};

// Confirm legacy booking completion
export const completeLegacyBooking = (bookingId) => {
  return axiosInstance.put(`/bookings/complete/${bookingId}`);
};

// Service Request (client) APIs
export const getClientRequests = () => {
  return axiosInstance.get(`/service-request/my-requests`);
};

export const confirmServiceCompletion = (requestId) => {
  return axiosInstance.put(`/service-request/${requestId}/confirm`);
};

export const cancelServiceRequest = (requestId) => {
  return axiosInstance.put(`/service-request/${requestId}/cancel`);
};