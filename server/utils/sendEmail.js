import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const sendEmail = async (options) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
  return info;
};

export const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h2 style="color: #333; text-align: center;">Welcome to QuillJot!</h2>
      <p style="color: #666; line-height: 1.6;">
        Thank you for registering. To get started, please verify your email address by clicking the button below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #666; line-height: 1.6;">
        If the button doesn't work, you can also copy and paste this link into your browser:
        <br>
        <a href="${verificationUrl}" style="color: #4F46E5;">${verificationUrl}</a>
      </p>
      <p style="color: #666; line-height: 1.6;">
        This verification link will expire in 24 hours for security reasons.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        If you didn't create an account with QuillJot, please ignore this email.
      </p>
    </div>
  `;

  await sendEmail({
    email,
    subject: "Verify Your Email Address",
    html,
  });
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
      <p style="color: #666; line-height: 1.6;">
        You recently requested to reset your password. Click the button below to create a new password:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; line-height: 1.6;">
        If the button doesn't work, you can also copy and paste this link into your browser:
        <br>
        <a href="${resetUrl}" style="color: #4F46E5;">${resetUrl}</a>
      </p>
      <p style="color: #666; line-height: 1.6;">
        This password reset link will expire in 1 hour for security reasons.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
    </div>
  `;

  await sendEmail({
    email,
    subject: "Reset Your Password",
    html,
  });
};

export default sendEmail;
