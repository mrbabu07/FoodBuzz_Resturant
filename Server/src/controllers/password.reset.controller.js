const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendMail } = require("../utils/mailer");
const { logActivity } = require("../utils/activityLogger");

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Don't reveal if user exists or not (security)
    if (!user) {
      return res.json({
        message:
          "If an account exists with this email, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendMail({
      to: user.email,
      subject: "Password Reset Request - FoodBuzz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 20px;">
          <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f5576c; font-size: 32px; margin: 0;">🔐 Password Reset</h1>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${user.name},</p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              We received a request to reset your password for your FoodBuzz account.
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 30px;">
              This link will expire in 1 hour.
            </p>
            
            <p style="font-size: 14px; color: #f5576c; font-weight: bold; line-height: 1.6;">
              If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} FoodBuzz. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    await logActivity({
      userId: user._id,
      action: "PASSWORD_RESET_REQUESTED",
      meta: { email: user.email },
    });

    res.json({
      message:
        "If an account exists with this email, a password reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await logActivity({
      userId: user._id,
      action: "PASSWORD_RESET_COMPLETED",
      meta: { email: user.email },
    });

    // Send confirmation email
    await sendMail({
      to: user.email,
      subject: "Password Changed Successfully - FoodBuzz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h1 style="color: #4CAF50; font-size: 28px; margin-bottom: 20px;">✅ Password Changed</h1>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${user.name},</p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your password has been successfully changed.
            </p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              If you didn't make this change, please contact our support team immediately.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" 
                 style="display: inline-block; padding: 15px 40px; background: #4CAF50; color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">
                Login Now
              </a>
            </div>
          </div>
        </div>
      `,
    });

    res.json({
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/validate-reset-token
exports.validateResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "Invalid or expired reset token",
      });
    }

    res.json({
      valid: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Validate reset token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
