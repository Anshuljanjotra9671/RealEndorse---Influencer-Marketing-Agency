// helpers/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true", // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, text, html }) {
  if (!to) return;
  try {
    const info = await transporter.sendMail({
      from: `"Real Endorse" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    if (process.env.NODE_ENV !== "production") {
      console.log("Email sent:", info.messageId);
    }
  } catch (err) {
    console.error("Email send error:", err);
  }
}

module.exports = { sendMail };
