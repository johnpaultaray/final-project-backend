import nodemailer from 'nodemailer';
import configData from '../config.json';

interface SmtpOptions {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
}

interface Config {
  emailFrom: string;
  smtpOptions: SmtpOptions;
}

const config = configData as Config;

export default async function sendEmail({
  to,
  subject,
  html,
  from = config.emailFrom,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const transporter = nodemailer.createTransport(config.smtpOptions);

  await transporter.sendMail({ from, to, subject, html });
}
