import axios from "axios";
import { decrypt, getSession } from "../session";
import { refreshToken } from "../auth";

const instance = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true,
});

// Add request interceptor to add token to every request
instance.interceptors.request.use(
  async (config) => {
    // Try to get token from cookie directly
    const session = await getSession();
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const session = await getSession();
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry && session?.refreshToken) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        const newToken = await refreshToken(session?.refreshToken);

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

    return Promise.reject(error);
  }
);

export default instance;
