import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

interface EmailOptions { to: string; subject: string; html: string; }

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  await transporter.sendMail({ from: `"${process.env.NEXT_PUBLIC_APP_NAME}" <${process.env.EMAIL_FROM}>`, to, subject, html });
}

export function otpEmailTemplate(otp: string, name: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#FF6B35">Dishly Verification Code</h2>
      <p>Hi ${name},</p>
      <p>Your verification code is:</p>
      <div style="background:#f4f4f4;padding:20px;text-align:center;border-radius:8px;margin:20px 0">
        <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#FF6B35">${otp}</span>
      </div>
      <p>This code expires in 10 minutes. Do not share it with anyone.</p>
      <p style="color:#999;font-size:12px">If you didn't request this, please ignore this email.</p>
    </div>`;
}

export function welcomeEmailTemplate(name: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#FF6B35">Welcome to Dishly! 🍽️</h2>
      <p>Hi ${name},</p>
      <p>Your account has been created successfully. Start exploring thousands of restaurants near you!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/browse" style="background:#FF6B35;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">Start Ordering</a>
    </div>`;
}

export function orderConfirmationTemplate(orderNumber: string, total: number, name: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#FF6B35">Order Confirmed! 🎉</h2>
      <p>Hi ${name}, your order <strong>#${orderNumber}</strong> has been confirmed.</p>
      <p>Total: <strong>₦${total.toLocaleString()}</strong></p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="background:#FF6B35;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">Track Order</a>
    </div>`;
}

export function passwordResetTemplate(resetUrl: string, name: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#FF6B35">Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="background:#FF6B35;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">Reset Password</a>
      <p style="color:#999;font-size:12px;margin-top:20px">If you didn't request this, please ignore this email.</p>
    </div>`;
}
