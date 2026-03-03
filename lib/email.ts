import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendOTPEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"Overseed" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Your Overseed verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #4F46E5; font-size: 28px; margin-bottom: 8px;">Overseed</h1>
        <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
          Enter the following code to verify your email address:
        </p>
        <div style="background: #F3F4F6; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #111827;">${otp}</span>
        </div>
        <p style="color: #6B7280; font-size: 14px;">
          This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}
