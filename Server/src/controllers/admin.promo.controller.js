const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

exports.sendPromoToSubscribedUsers = async (req, res) => {
  try {
    const { subject, html } = req.body;

    if (!subject || !html) {
      return res.status(400).json({ message: "subject and html are required" });
    }

    const receivers = await User.find({
      role: "user",
      isActive: true,
      "notificationPrefs.promoEmails": true
    })
      .select("email")
      .lean();

    const emails = receivers.map(u => u.email).filter(Boolean);

    let sent = 0;
    for (const to of emails) {
      try {
        await sendMail({ to, subject, html });
        sent++;
      } catch (e) {
        console.log("Promo send failed:", to, e.message);
      }
    }

    return res.json({
      message: "Promo emails sent",
      totalReceivers: emails.length,
      sent
    });
  } catch (err) {
    console.error("sendPromoToSubscribedUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
