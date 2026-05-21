import nodemailer from 'nodemailer';
import config from '../config.json';

interface EmailParams {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export default async function sendEmail({
    to,
    subject,
    html,
    from
}: EmailParams) {

    // Default sender email
    const emailFrom =
        from ||
        process.env.FROM_EMAIL ||
        config.emailFrom ||
        'onboarding@resend.dev';

    // Create SMTP transporter using Resend
    const transporter = nodemailer.createTransport({
        host: process.env.RESEND_SMTP_HOST || 'smtp.resend.com',

        port: Number(process.env.RESEND_SMTP_PORT) || 465,

        secure: true,

        auth: {
            user: process.env.RESEND_SMTP_USER || 'resend',

            // Your Resend API key
            pass: process.env.RESEND_SMTP_PASS
        }
    });

    try {

        // Send email
        const info = await transporter.sendMail({
            from: emailFrom,
            to,
            subject,
            html
        });

        console.log('✅ Email sent successfully');
        console.log(info.messageId);

        return info;

    } catch (error) {

        console.error('❌ Failed to send email');
        console.error(error);

        throw error;
    }
}