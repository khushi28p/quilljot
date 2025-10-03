import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  revoked: {
    type: Boolean,
    default: false,
  },
  replacedByToken: {
    type: String,
  },
});

// Index to find and clean up expired tokens
RefreshTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

RefreshTokenSchema.methods.isExpired = function () {
  return Date.now() >= this.expires.getTime();
};

RefreshTokenSchema.methods.isActive = function () {
  return !this.revoked && !this.isExpired();
};

export default mongoose.model("RefreshToken", RefreshTokenSchema);
