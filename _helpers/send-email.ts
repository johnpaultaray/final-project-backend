import nodemailer from 'nodemailer';

// Define an interface for the function arguments for strict type safety
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Sends an email using Nodemailer via Ethereal SMTP.
 * * It reads directly from config.json by default, with optional fallbacks
 * to system environment variables for clean configuration management.
 */
export default async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<void> {
  // Use the email address specified in env, otherwise fallback to a generic domain
  const emailSender = from || process.env.EMAIL_FROM || 'info@my-node-api.com';

  // Build SMTP configurations cleanly
  const smtpOptions = {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // Must be false for Ethereal port 587 (TLS/STARTTLS)
    auth: {
      user: process.env.SMTP_USER || 'ewell.ohara86@ethereal.email',
      pass: process.env.SMTP_PASS || 'rEjSxtUnxbDdFwQ59S'
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
  };

  // Create the transporter instance
  const transporter = nodemailer.createTransport(smtpOptions);
  
  try {
    // Attempt to dispatch the email payload
    await transporter.sendMail({ 
      from: emailSender, 
      to, 
      subject, 
      html 
    });
    console.log(`📧 Ethereal test email cleanly dispatched to: ${to}`);
  } catch (err) {
    console.error('❗️ Nodemailer Email dispatch failed:', err);
    // Re-throw the original error so that controllers/services can handle the 500 status code properly
    throw err; 
  }
}