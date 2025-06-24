import axios from "axios";
import { refreshToken } from "../auth";
import { FRONTEND_URL } from "../constants";
import { deleteClientSession, getClientSession } from "../hooks";

const instance = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true,
});

export const sessionAxiosInstance = axios.create({
  baseURL: FRONTEND_URL + "/api",
  withCredentials: true,
});

// Add request interceptor to add token to every request
instance.interceptors.request.use(
  async (config) => {
    // Try to get token from cookie directly
    const session = await getClientSession();
    console.log("Session", session);
    // If token exists, add it to the Authorization header
    if (session?.accessToken) {
      const token = session.accessToken;
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
instance.interceptors.response.use(
  (response) => {
    console.log("Response", response);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isRefreshURL = originalRequest.url.includes("/auth/refresh");
    console.log("isRefreshURL", isRefreshURL);
    // If error is 401 and we haven't tried to refresh token yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshURL
    ) {
      console.log("Retrying");
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        const session = await getClientSession();
        let newToken;
        console.log("Session", session);

        if (!session) {
          deleteClientSession();
          window.location.href = "/";
          return Promise.reject(error);
        }

        if (session?.refreshToken) {
          newToken = await refreshToken(session?.refreshToken);
        }

        // Update the Authorization header with the new token
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Retry the original request
        return instance(originalRequest);
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        // Redirect to login page if refresh fails
        // window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    if (error.response.status === 401 && isRefreshURL) {
      deleteClientSession();
    }

    return Promise.reject(error);
  }
);

sessionAxiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const isRefreshUrl = originalRequest.url.includes("refreshToken");
    if (
      err.response?.status === 401 &&
      !isRefreshUrl &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const session = await getClientSession();
      if (session?.refreshToken) {
        const newToken = await refreshToken(session?.refreshToken);

        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        return sessionAxiosInstance(originalRequest);
      }
    }

    if (err.response?.status === 401 && isRefreshUrl) {
      deleteClientSession();
    }
  }
);

export default instance;
