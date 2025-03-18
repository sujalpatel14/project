import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, required: true, expires: 300 },
});

export const OTP = mongoose.model("OTP", otpSchema);
