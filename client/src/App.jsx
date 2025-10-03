import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthForm from "./pages/AuthForm";
import Dashboard from "./pages/Dashboard";
import EmailVerification from "./pages/EmailVerification";
import OAuthCallback from "./pages/OAuthCallback";
import { useAuthStore } from "./store/useAuthStore";

// Enhanced ProtectedRoute with loading state
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuthStore();
  const [checked, setChecked] = React.useState(false);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  React.useEffect(() => {
    const verifyAuth = async () => {
      await checkAuthStatus();
      setChecked(true);
    };
    verifyAuth();
  }, [checkAuthStatus]);

  if (!checked || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/register" element={<AuthForm type="register" />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        {/* If the user is logged in, they hit the root, they should go to dashboard */}
        <Route path="/home" element={<HomePage />} />

        {/* Protected Routes (Require Authentication) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-post"
          element={
            <ProtectedRoute>
              {/* Placeholder for Editor Component */}
              <div className="text-center p-20">
                New Post Editor (Protected)
              </div>
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
