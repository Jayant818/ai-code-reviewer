import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true, // sends cookies automatically
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const orginalRequest = error.config;

    if (error.response?.status === 401 && !orginalRequest._retry) {
      orginalRequest._retry = true;

      try {
        await axios.get("http://localhost:3001/auth/refreshToken", {
          withCredentials: true,
        });

        return instance(orginalRequest);
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
