import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER) {
    // Return null to indicate console fallback
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: parseInt(SMTP_PORT || '587', 10) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || 'noreply@placehub.dev';

  if (!transporter) {
    // Console fallback for development
    console.log('\n📧 ====== EMAIL (Console Fallback) ======');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text || options.html}`);
    console.log('========================================\n');
    return;
  }

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export function verifyEmailTemplate(token: string, email: string): EmailOptions {
  const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}&email=${email}`;
  return {
    to: email,
    subject: 'Verify your PlaceHub account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to PlaceHub!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${url}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email
        </a>
        <p style="margin-top: 16px; color: #666;">Or copy this link: ${url}</p>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    `,
    text: `Verify your PlaceHub account: ${url}`,
  };
}

export function passwordResetTemplate(token: string, email: string): EmailOptions {
  const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${email}`;
  return {
    to: email,
    subject: 'Reset your PlaceHub password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${url}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
        <p style="margin-top: 16px; color: #666;">Or copy this link: ${url}</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Reset your PlaceHub password: ${url}`,
  };
}
