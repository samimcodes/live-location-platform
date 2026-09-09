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
  const candidatePaths = [
    path.join(process.cwd(), 'server', 'templates', 'emails', `${templateName}.hbs`),
    path.join(__dirname, '..', 'templates', 'emails', `${templateName}.hbs`),
    path.join(__dirname, '..', '..', 'server', 'templates', 'emails', `${templateName}.hbs`),
  ];

  const foundPath = candidatePaths.find((p) => fs.existsSync(p));

  let html: string;
  if (foundPath) {
    const templateSource = fs.readFileSync(foundPath, 'utf8');
    const compiled = handlebars.compile(templateSource);
    html = compiled(context);
  } else {
    // Graceful fallback if .hbs template files were not copied to dist/
    const link = (context.resetLink as string) || '';
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; rounded: 8px;">
        <h2 style="color: #6366f1;">${subject}</h2>
        <p>Hello ${context.name || 'there'},</p>
        <p>${subject}. If you requested this action, please use the button or link below:</p>
        ${link ? `<p><a href="${link}" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Continue</a></p><p><small style="color: #888;">${link}</small></p>` : ''}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} LocaLink. All rights reserved.</p>
      </div>
    `;
  }

  return sendEmail(to, subject, 'Please view this email in an HTML-capable client.', html);
};
