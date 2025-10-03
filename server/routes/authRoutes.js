import express from "express";
import passport from "passport";
import crypto from "crypto";
import RefreshToken from "../models/RefreshToken.js";
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  getCurrentUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/logout", protect, logout);
authRouter.get("/me", protect, getCurrentUser);
authRouter.post("/refresh-token", refreshToken);

// Email verification routes
authRouter.get("/verify-email/:token", verifyEmail);

// Password reset routes
authRouter.post("/forgot-password", forgotPassword);
authRouter.put("/reset-password/:token", resetPassword);
authRouter.put("/update-password", protect, updatePassword);

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
  }),
  async (req, res) => {
    try {
      // Generate tokens using our existing token generation function
      const accessToken = req.user.getSignedJwtToken();
      const refreshToken = crypto.randomBytes(40).toString("hex");

      // Save refresh token
      await RefreshToken.create({
        user: req.user._id,
        token: refreshToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Set cookie options using maxAge instead of expires
      const cookieOptions = {
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      };

      const refreshCookieOptions = {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      };

      // Set cookies
      res.cookie("token", accessToken, cookieOptions);
      res.cookie("refreshToken", refreshToken, refreshCookieOptions);

      // Redirect with token
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      res.redirect(`${clientUrl}/oauth-callback?token=${accessToken}`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/login?error=oauth_failed`
      );
    }
  }
);

export default authRouter;
