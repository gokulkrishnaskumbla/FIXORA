import { axiosInstance } from "../axios/axiosinstance";

// Admin Login
export const adminLogin = (data) => {
  return axiosInstance.post("/admin/login", data);
};

// Admin Logout
export const adminLogout = () => {
  return axiosInstance.post("/admin/logout");
};

// Get All Users
export const getAllUsers = () => {
  return axiosInstance.get("/user/all-users");
};

// Get All Bookings
export const getAllBookings = () => {
  return axiosInstance.get("/bookings/all-bookings");
};

// List Services (for admin)
export const listServices = () => {
  return axiosInstance.get("/service/listservices");
};

// Create Service
export const createService = (formData) => {
  return axiosInstance.post("/service/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Update Service
export const updateService = (serviceId, formData) => {
  return axiosInstance.put(`/service/update/${serviceId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete Service
export const deleteService = (serviceId) => {
  return axiosInstance.delete(`/service/delete/${serviceId}`);
};

// Cancel Booking (Admin)
export const cancelBookingAdmin = (bookingId) => {
  return axiosInstance.put(`/bookings/cancel/${bookingId}`);
};

// Get All Contacts
export const getAllContacts = () => {
  return axiosInstance.get("/contact/all-contacts");
};

// Delete Contact
export const deleteContact = (contactId) => {
  return axiosInstance.delete(`/contact/delete/${contactId}`);
};

// Get All Reviews
export const getAllReviews = () => {
  return axiosInstance.get("/review/all");
};

// Delete Review (Admin)
export const deleteReviewAdmin = (reviewId) => {
  return axiosInstance.delete(`/review/admin/delete/${reviewId}`);
};

// Provider Management
export const getPendingProviders = () => {
  return axiosInstance.get("/admin/providers/pending");
};

export const getAllProviders = (status = null) => {
  const params = status && status !== "all" ? { status } : {};
  return axiosInstance.get("/admin/providers", { params });
};

export const getProviderDetails = (providerId) => {
  return axiosInstance.get(`/admin/providers/${providerId}`);
};

export const verifyProvider = (providerId, payload) => {
  return axiosInstance.put(`/admin/providers/${providerId}/verify`, payload);
};

export const getAdminAnalytics = () => {
  return axiosInstance.get("/admin/analytics");
};

