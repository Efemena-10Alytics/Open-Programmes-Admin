import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { signOut } from "@/lib/auth-client";
import { APIURL } from "./api-address";

const config: AxiosRequestConfig = {
  baseURL: APIURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

const axiosInstance: AxiosInstance = axios.create(config);

// Request interceptor to add auth token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Only auto-add from defaults if on client and NOT already set
    if (typeof window !== "undefined") {
      const token = axiosInstance.defaults.headers.common["Authorization"];
      if (token && !config.headers.Authorization && !config.headers.authorization) {
        config.headers.Authorization = token;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Authentication error detected:", error.response?.data);
      
      // Clear the auth token (only on client)
      if (typeof window !== "undefined") {
        delete axiosInstance.defaults.headers.common["Authorization"];
        // Clear session cookie
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // Don't auto-redirect - let the page handle it with error UI
        // Components can use the error to show a message and optionally redirect
      }
    }
    return Promise.reject(error);
  }
);

const setAuthToken = (token?: string) => {
  // Only set global headers on the client to avoid server-side pollution
  if (typeof window !== "undefined") {
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log(`🔐 Auth token set successfully (Client)`);
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
      console.log(`🔓 Auth token removed (Client)`);
    }
  } else {
    // On server, we just log (or do nothing) because tokens are passed per-request in headers
    // console.log(`⏩ Skipping setAuthToken on Server (tokens should be passed explicitly)`);
  }
};

export { axiosInstance, setAuthToken };
