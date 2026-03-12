const nodemailer = require('nodemailer');
const config = require('../config');

function isSmtpConfigured() {
  return Boolean(config.smtpHost && config.smtpPort && config.smtpUser && config.smtpPass && config.smtpFromEmail);
}

function createTransporter() {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL.');
  }

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

async function sendWelcomeTestEmail({ toEmail, requestedBy }) {
  const transporter = createTransporter();
  const fromName = config.smtpFromName || 'Smiles Dental Hub';
  const from = `"${fromName}" <${config.smtpFromEmail}>`;
  const by = requestedBy || 'Admin';

  const subject = 'Smiles Dental Hub - Email Delivery Test';
  const text = [
    'Hello,',
    '',
    'This is a test email from Smiles Dental Hub.',
    'If you received this, your email delivery is working.',
    '',
    `Requested by: ${by}`,
    `Sent at: ${new Date().toISOString()}`,
    '',
    'No action is required.',
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#1f2937;line-height:1.6">
      <p>Hello,</p>
      <p>This is a test email from <strong>Smiles Dental Hub</strong>.</p>
      <p>If you received this, your email delivery is working.</p>
      <p style="margin-top:16px">
        <strong>Requested by:</strong> ${String(by)}<br />
        <strong>Sent at:</strong> ${new Date().toISOString()}
      </p>
      <p style="margin-top:16px">No action is required.</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from,
    to: toEmail,
    subject,
    text,
    html,
  });

  return info;
}

module.exports = {
  isSmtpConfigured,
  sendWelcomeTestEmail,
};
