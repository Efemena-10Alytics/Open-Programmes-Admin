import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
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
    // Get token from the instance's default headers if it exists
    const token = axiosInstance.defaults.headers.common["Authorization"];

    if (token) {
      config.headers.Authorization = token;
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
      console.error("Authentication error:", error.response?.data);
    }
    return Promise.reject(error);
  }
);

const setAuthToken = (token?: string) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Auth token set successfully");
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
    console.log("Auth token removed");
  }
};

export { axiosInstance, setAuthToken };
