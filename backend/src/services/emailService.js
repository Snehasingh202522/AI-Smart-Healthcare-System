const nodemailer = require('nodemailer');
const { email, clientUrl } = require('../config/env');

const createTransporter = () => {
  if (!email.user || !email.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: email.host,
    port: email.port,
    auth: {
      user: email.user,
      pass: email.pass,
    },
  });
};

const sendResetPasswordEmail = async (toEmail, resetToken) => {
  const transporter = createTransporter();
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  if (!transporter) {
    console.log(`[DEV] Password reset link for ${toEmail}: ${resetUrl}`);
    return { success: true, devMode: true, resetUrl };
  }

  const mailOptions = {
    from: `"HealthCare AI" <${email.user}>`,
    to: toEmail,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p style="margin-top: 20px; color: #666;">This link expires in 15 minutes.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true };
};

module.exports = {
  sendResetPasswordEmail,
};
