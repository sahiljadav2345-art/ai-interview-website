const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

const passwordResetEmail = (resetLink) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
};

const verificationEmail = (verificationLink) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Email Verification</h2>
      <p>Welcome! Please verify your email to activate your account:</p>
      <a href="${verificationLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;
};

module.exports = {
  sendEmail,
  passwordResetEmail,
  verificationEmail
};
