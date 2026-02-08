// path: backend_sara/roms-backend/src/utils/mailer.js
const nodemailer = require("nodemailer");

function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // ✅ 465 => true, 587 => false
    auth: { user, pass },
  });
}

async function sendMail({ to, subject, html, text }) {
  const transporter = buildTransporter();

  if (!transporter) {
    console.warn("SMTP not configured. Skipping email.");
    return { skipped: true };
  }

  return transporter.sendMail({
    from: `"${process.env.APP_NAME || "ROMS"}" <${process.env.APP_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text, // optional
  });
}

module.exports = { sendMail };
