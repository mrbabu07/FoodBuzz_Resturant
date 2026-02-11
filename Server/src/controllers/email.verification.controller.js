const User = require("../models/User");
const crypto = require("crypto");
const { sendMail } = require("../utils/mailer");
const { logActivity } = require("../utils/activityLogger");

// Send verification email
exports.sendVerificationEmail = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.emailVerified) {
      return { message: "Email already verified" };
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await sendMail({
      to: user.email,
      subject: "Verify Your Email - FoodBuzz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px;">
          <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #667eea; font-size: 32px; margin: 0;">🎉 Welcome to FoodBuzz!</h1>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${user.name},</p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Thank you for registering with FoodBuzz! We're excited to have you on board.
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 30px;">
              This link will expire in 24 hours.
            </p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              If you didn't create an account with FoodBuzz, please ignore this email.
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
      action: "VERIFICATION_EMAIL_SENT",
      meta: { email: user.email },
    });

    return { message: "Verification email sent" };
  } catch (error) {
    console.error("Send verification email error:", error);
    throw error;
  }
};

// POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Verification token is required" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    await logActivity({
      userId: user._id,
      action: "EMAIL_VERIFIED",
      meta: { email: user.email },
    });

    res.json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/resend-verification
exports.resendVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await exports.sendVerificationEmail(userId);

    res.json(result);
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/check-verification
exports.checkVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("emailVerified");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      emailVerified: user.emailVerified,
      message: user.emailVerified ? "Email is verified" : "Email not verified",
    });
  } catch (error) {
    console.error("Check verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.sendVerificationEmail = exports.sendVerificationEmail;
