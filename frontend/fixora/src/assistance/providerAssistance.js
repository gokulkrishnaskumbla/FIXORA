import { axiosInstance } from "../axios/axiosinstance";

export const registerProvider = (data) => {
  return axiosInstance.post("/provider/register", data);
};

export const getProviderProfile = () => {
  return axiosInstance.get("/provider/profile");
};

export const updateProviderProfile = (payload) => {
  return axiosInstance.put("/provider/profile", payload);
};

export const updateProviderAvailability = (payload) => {
  return axiosInstance.put("/provider/availability", payload);
};

export const getProviderRequests = () => {
  return axiosInstance.get("/provider/requests");
};

export const respondToRequest = (requestId, action, body = {}) => {
  // If this is a booking-derived request (we prefix booking IDs with 'booking-')
  if (typeof requestId === 'string' && requestId.startsWith('booking-')) {
    const bookingId = requestId.replace('booking-', '');
    if (action === 'accept') {
      return axiosInstance.put(`/bookings/provider/accept/${bookingId}`, body);
    } else {
      return axiosInstance.put(`/bookings/provider/cancel/${bookingId}`, body);
    }
  }

  const endpoint = action === "accept" ? "accept" : "decline";
  return axiosInstance.put(`/provider/requests/${requestId}/${endpoint}`, body);
};

export const getProviderEarnings = () => {
  return axiosInstance.get("/provider/earnings");
};

export const getProviderStats = () => {
  return axiosInstance.get("/provider/stats");
};

// Provider services
export const createProviderService = (formData) => {
  // formData should be a FormData instance when including files
  return axiosInstance.post("/provider/services", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getMyServices = () => {
  return axiosInstance.get("/provider/services");
};

export const updateProviderService = (serviceId, formData) => {
  return axiosInstance.put(`/provider/services/${serviceId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteProviderService = (serviceId) => {
  return axiosInstance.delete(`/provider/services/${serviceId}`);
};


