import nodemailer from 'nodemailer';
import config from '../config.json';

/**
 * Sends an email using Nodemailer.
 * Falls back to environment variables for SMTP configuration so you can keep
 * sensitive credentials out of source control. Errors are logged and re‑thrown
 * for the caller to handle.
 */
export default async function sendEmail({ to, subject, html, from = config.emailFrom }: any) {
  // Resolve SMTP options – prefer environment variables, otherwise use config.json
  const smtpOptions = {
    host: process.env.RESEND_SMTP_HOST || config.smtpoptions.host,
    port: parseInt(process.env.RESEND_SMTP_PORT || `${config.smtpoptions.port}`),
    auth: {
      user: process.env.RESEND_SMTP_USER || config.smtpoptions.auth.user,
      pass: process.env.RESEND_SMTP_PASS || config.smtpoptions.auth.pass
    }
  };

  const transporter = nodemailer.createTransport(smtpOptions);
  try {
    await transporter.sendMail({ from, to, subject, html });
  } catch (err) {
    console.error('❗️ Email sending failed:', err);
    throw err;
  }
}
