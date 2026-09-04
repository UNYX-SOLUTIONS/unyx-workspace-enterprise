import axios from "axios";
import { env } from "@/config/env";

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("unyx_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const onLoginPage = window.location.pathname === "/login";
      if (!onLoginPage && localStorage.getItem("unyx_token")) {
        localStorage.removeItem("unyx_token");
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);
