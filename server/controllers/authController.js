import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail, {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/sendEmail.js";

const generateRefreshToken = async (user) => {
  // Generate a random token
  const refreshToken = crypto.randomBytes(40).toString("hex");

  // Save refresh token with a TTL
  const refreshTokenDoc = await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return refreshTokenDoc.token;
};

const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = user.getSignedJwtToken();
  const refreshToken = await generateRefreshToken(user);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Set refresh token in http-only cookie
  const refreshOptions = {
    ...options,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };

  res
    .status(statusCode)
    .cookie("token", accessToken, options)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
};

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("user with that email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate email verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save();

  try {
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(500);
    throw new Error("Email could not be sent");
  }
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide an email and password.");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  sendTokenResponse(user, 200, res);
});

export const logout = asyncHandler(async (req, res, next) => {
  // Get refresh token from cookie
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Revoke refresh token
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { revoked: true }
    );
  }

  // Clear both cookies
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.cookie("refreshToken", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token required");
  }

  // Verify refresh token
  const refreshTokenDoc = await RefreshToken.findOne({
    token: refreshToken,
    revoked: false,
  });

  if (!refreshTokenDoc || !refreshTokenDoc.isActive()) {
    res.status(401);
    throw new Error("Refresh token expired or invalid");
  }

  // Get user
  const user = await User.findById(refreshTokenDoc.user);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Generate new tokens
  const newAccessToken = user.getSignedJwtToken();
  const newRefreshToken = await generateRefreshToken(user);

  // Revoke old refresh token
  refreshTokenDoc.revoked = true;
  refreshTokenDoc.replacedByToken = newRefreshToken;
  await refreshTokenDoc.save();

  // Set new cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const refreshOptions = {
    ...options,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  res
    .cookie("token", newAccessToken, options)
    .cookie("refreshToken", newRefreshToken, refreshOptions)
    .json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = asyncHandler(async (req, res) => {
  const emailVerificationToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired verification token");
  }

  // Update user
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  // Send token response
  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error("No user found with that email");
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Update password (when logged in)
// @route   PUT /api/auth/update-password
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // Set new password
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
    },
  });
});
