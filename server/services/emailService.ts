import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<nodemailer.SentMessageInfo> => {
  const info = await transporter.sendMail({
    from: `"${process.env.FROM_NAME || 'LocaLink'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
  console.log(`📧  Email sent: ${info.messageId}`);
  return info;
};

export const sendTemplateEmail = async (
  to: string,
  subject: string,
  templateName: string,
  context: Record<string, unknown>
): Promise<nodemailer.SentMessageInfo> => {
  const templatePath = path.join(
    process.cwd(),
    'server',
    'templates',
    'emails',
    `${templateName}.hbs`
  );
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const compiled = handlebars.compile(templateSource);
  const html = compiled(context);

  return sendEmail(to, subject, 'Please view this email in an HTML-capable client.', html);
};
