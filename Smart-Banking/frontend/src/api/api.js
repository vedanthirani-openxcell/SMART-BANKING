// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend auth route
});

// Register user
export const registerUser = (userData) => api.post("/register", userData);

// Login user
export const loginUser = (userData) => api.post("/login", userData);



api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
