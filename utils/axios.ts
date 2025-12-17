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

const setAuthToken = (token?: string) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

export { axiosInstance, setAuthToken };
