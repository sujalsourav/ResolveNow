import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

export async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SMTP_USER) {
    console.log('[Email not configured]', { to, subject });
    return { ok: true };
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html: html || text,
      text,
    });
    return { ok: true };
  } catch (err) {
    console.error('Send email error:', err);
    return { ok: false, error: err.message };
  }
}

export function verificationEmail(link) {
  return {
    subject: 'Verify your ResolveNow account',
    html: `
      <h2>ResolveNow - Verify your email</h2>
      <p>Please click the link below to verify your account:</p>
      <a href="${link}">${link}</a>
      <p>If you did not create an account, ignore this email.</p>
    `,
  };
}

export function complaintConfirmationEmail(complaintId, title) {
  return {
    subject: `Complaint registered: ${complaintId}`,
    html: `
      <h2>Complaint successfully registered</h2>
      <p>Your complaint <strong>${complaintId}</strong> has been received.</p>
      <p>Title: ${title}</p>
      <p>You can track its status from your dashboard.</p>
    `,
  };
}

export function statusUpdateEmail(complaintId, status, resolution) {
  return {
    subject: `Update on complaint ${complaintId}`,
    html: `
      <h2>Complaint update</h2>
      <p>Complaint ID: <strong>${complaintId}</strong></p>
      <p>New status: <strong>${status}</strong></p>
      ${resolution ? `<p>Resolution: ${resolution}</p>` : ''}
    `,
  };
}
