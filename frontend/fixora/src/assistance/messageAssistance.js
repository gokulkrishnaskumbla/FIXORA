import { axiosInstance } from "../axios/axiosinstance";

export const sendMessage = (payload) => {
  return axiosInstance.post(`/message/send`, payload);
};

export const getMessagesForRequest = (requestId) => {
  return axiosInstance.get(`/message/request/${requestId}`);
};

export const getConversations = () => {
  return axiosInstance.get(`/message/conversations`);
};

export default { sendMessage, getMessagesForRequest, getConversations };
