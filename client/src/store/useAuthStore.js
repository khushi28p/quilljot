import { create } from "zustand";
import api from "@/lib/axios";

const initialState = {
  isLoggedIn: false,
  user: null,
  isLoading: false,
  error: null,
  isEmailVerified: false,
};

export const useAuthStore = create((set, get) => ({
  ...initialState,

  // State getters
  isLoading: false,
  error: null,

  // Login with email/password
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, user } = response.data;

      localStorage.setItem("authToken", accessToken);
      set({
        isLoggedIn: true,
        user,
        isEmailVerified: user.isEmailVerified,
        error: null,
      });

      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoggedIn: false,
        user: null,
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post("/auth/register", userData);

      set({ error: null });
      return response.data;
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.status === 400
          ? "Invalid registration details. Please check your information."
          : error.response?.status === 500
          ? "Server error. Please try again later."
          : "Registration failed. Please try again.");
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout user
  logout: async () => {
    try {
      set({ isLoading: true });
      await api.get("/auth/logout");
      localStorage.removeItem("authToken");
      set(initialState);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({ isLoading: false });
      // Force reload to clear any cached state
      window.location.href = "/";
    }
  },

  // Request password reset
  forgotPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post("/auth/forgot-password", { email });
      set({ error: null });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to send reset email",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Reset password with token
  resetPassword: async (token, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.put(`/auth/reset-password/${token}`, {
        password,
      });
      set({ error: null });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Password reset failed" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Update password when logged in
  updatePassword: async (currentPassword, newPassword) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.put("/auth/update-password", {
        currentPassword,
        newPassword,
      });
      set({ error: null });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update password",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Verify email with token
  verifyEmail: async (token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/auth/verify-email/${token}`);
      set({
        isEmailVerified: true,
        error: null,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Email verification failed",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Check auth status on app load
  checkAuthStatus: async () => {
    const token = localStorage.getItem("authToken");

    // If there's no token, no need to check
    if (!token) {
      set({ ...initialState, isLoading: false });
      return false;
    }

    try {
      set({ isLoading: true });

      // Try to get user data with current token
      const response = await api.get("/auth/me");
      set({
        isLoggedIn: true,
        user: response.data.user,
        isEmailVerified: response.data.user.isEmailVerified,
        error: null,
      });
      return true;
    } catch (error) {
      // Handle 401 unauthorized errors by trying to refresh the token
      if (error.response?.status === 401) {
        try {
          // Attempt to refresh the token
          const refreshResponse = await api.post("/auth/refresh-token");
          if (refreshResponse.data?.accessToken) {
            localStorage.setItem("authToken", refreshResponse.data.accessToken);

            // Retry getting user data with new token
            const userResponse = await api.get("/auth/me");
            set({
              isLoggedIn: true,
              user: userResponse.data.user,
              isEmailVerified: userResponse.data.user.isEmailVerified,
              error: null,
            });
            return true;
          }
        } catch (refreshError) {
          console.log("Token refresh failed:", refreshError);
          localStorage.removeItem("authToken");
          set({
            ...initialState,
            error: "Session expired. Please login again.",
          });
        }
      } else {
        console.log("Auth check failed:", error);
        localStorage.removeItem("authToken");
        set({
          ...initialState,
          error: "Authentication failed. Please login again.",
        });
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Clear any error state
  clearError: () => set({ error: null }),
}));
