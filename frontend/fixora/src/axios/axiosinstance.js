import axios from 'axios';

const url=import.meta.env.VITE_BASE_URL
console.log(url,"baseURL")

const axiosInstance=axios.create({
    baseURL: url,
    withCredentials:true
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export {axiosInstance}