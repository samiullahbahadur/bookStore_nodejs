import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://bookstore-nodejs-74il.onrender.com", // remove the space at start and optional trailing slash
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
