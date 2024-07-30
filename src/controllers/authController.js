import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiErrors.js';
import { User } from '../models/user.models.js';
import { generateOTP } from '../utils/otpUtils.js';
import { sendEmail } from '../utils/emailUtils.js';
import {generateAccessAndRefreshTokens} from '../controllers/user.controler.js'
// Function to request OTP
export const requestOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  await user.save();

  await sendEmail(user.email, 'Your OTP', `Your login OTP is ${otp}`);

  res.status(200).json({ message: 'OTP sent successfully' });
});

// Function to verify OTP and login
export const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
  
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }
  
    await user.clearOTP();
  
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
    const options = { httpOnly: true, secure: true };
    res.status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json({ message: 'Logged in successfully', accessToken, refreshToken });
  });