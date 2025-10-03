import axios from "axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
const api = axios.create({
  baseURL: BACKEND_URL.replace(/["']/g, "").replace(/\/+$/, ""),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If original request was refresh token request and it failed, redirect to login
    if (originalRequest.url === "/auth/refresh-token") {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Attempt to refresh token
      const response = await api.post("/auth/refresh-token");

      if (response.data?.accessToken) {
        // Store the new token
        localStorage.setItem("authToken", response.data.accessToken);

        // Update Authorization header with new token
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.accessToken}`;
        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${response.data.accessToken}`;

        // Retry original request with new token
        return api(originalRequest);
      }
    } catch (refreshError) {
      // If refresh fails, clear storage and redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/login?error=session_expired";
      return Promise.reject(refreshError);
    }
  }
);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
