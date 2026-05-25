import { Resend } from 'resend';

// Define an interface for the function arguments for strict type safety
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Sends an email using the Resend API.
 * Uses RESEND_API_KEY from environment variables.
 */
export default async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<void> {
  // Initialize Resend with the API key from environment variables
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Use the provided from address, the EMAIL_FROM env var, or fallback to Resend's testing domain
  const emailSender = from || process.env.EMAIL_FROM || 'onboarding@resend.dev';

  try {
    // Attempt to dispatch the email payload via Resend
    const data = await resend.emails.send({
      from: emailSender,
      to,
      subject,
      html
    });

    if (data.error) {
      console.error('❗️ Resend API error:', data.error);
      throw new Error(data.error.message);
    }
    
    console.log(`📧 Resend email cleanly dispatched to: ${to}`);
  } catch (err) {
    console.error('❗️ Email dispatch failed:', err);
    // Re-throw the original error so that controllers/services can handle the 500 status code properly
    throw err; 
  }
}