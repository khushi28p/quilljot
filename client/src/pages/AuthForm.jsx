// AuthForm.jsx (Conceptual Component)

import React, { useState } from "react";
// We are now importing these from your local shadcn/ui components folder
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// Lucide icons
import { Mail, Key, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const AuthForm = ({ type }) => {
  const isLogin = type === "login";

  // State for form inputs (will be connected to Zustand later)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only for registration
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const authError = useAuthStore((state) => state.error);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const { login, register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle login
        await login(email, password);
        navigate("/dashboard");
      } else {
        // Handle registration
        await registerUser({ name, email, password });
        setError(null);
        // Show success message and redirect to login
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please check your email to verify your account.",
          },
        });
      }
    } catch (err) {
      console.error("Auth form error:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Network error. Please check your connection."
          : err.response?.status === 400
          ? "Please check your input details."
          : "Something went wrong. Please try again.");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden
                    bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900"
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:30px_30px] z-0"></div>
      <div className="absolute inset-0 opacity-20 bg-gradient-to-tl from-indigo-500/20 to-transparent z-0"></div>

      <Card
        className="w-full max-w-sm relative z-10 
                       bg-white border-2 border-indigo-200 rounded-xl 
                       shadow-2xl shadow-indigo-500/50 transition-all duration-500 hover:shadow-indigo-400/70"
      >
        <CardHeader className="text-center p-6 border-b border-gray-100">
          <div className="text-indigo-600 text-2xl font-bold">QuillJot.ai</div>
          <CardTitle className="text-3xl font-bold mt-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your dashboard."
              : "Sign up to start publishing your AI-enhanced content."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {/* 1. Google OAuth Button (Prominent Social Login) */}
          <Button
            variant="outline"
            disabled={isLoading}
            className="w-full flex items-center justify-center mb-6 py-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
            // This will link to the Node/Express Google OAuth endpoint later
            onClick={handleGoogleLogin}
          >
            Sign {isLogin ? "In" : "Up"} with Google
          </Button>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 font-medium">
                Or continue with Email
              </span>
            </div>
          </div>

          {/* Error Display */}
          {(error || authError) && (
            <div
              className="p-3 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-300"
              role="alert"
            >
              {error || authError}
            </div>
          )}

          {/* 2. Local Authentication Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {/* Name Field (Register Only) */}
              {!isLogin && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 h-11 text-base font-semibold shadow-md"
                disabled={isLoading} // Disable while loading
              >
                {/* NEW: Conditional Rendering for Spinner */}
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isLogin ? (
                  "Log In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </CardContent>

        {/* 3. Footer for Switching Views */}
        <CardFooter className="justify-center text-sm">
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:underline font-medium"
              >
                Log In
              </Link>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
