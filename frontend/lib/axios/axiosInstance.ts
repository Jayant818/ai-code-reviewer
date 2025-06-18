import axios from "axios";
import { getAccessTokenFromCookie } from "../cookies";

const instance = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true, // sends cookies automatically
});

// Add request interceptor to add token to every request
instance.interceptors.request.use(
  (config) => {
    // Try to get token from cookie directly
    const token = getAccessTokenFromCookie();

    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers.Authorization = `Bearer`;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        await axios.get("http://localhost:3001/auth/refreshToken", {
          withCredentials: true,
        });

        // Get the new token from cookie
        const newToken = getAccessTokenFromCookie();

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
