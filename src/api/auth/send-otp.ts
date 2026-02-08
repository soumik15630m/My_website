import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

const WHITELIST = ['soumik15630m@gmail.com', 'gsoumik2005@outlook.com'];

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!WHITELIST.includes(normalizedEmail)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const sql = neon(process.env.DATABASE_URL || '');

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate old OTPs
    await sql`UPDATE otp_codes SET used = true WHERE email = ${normalizedEmail} AND used = false`;

    // Save new OTP
    await sql`
      INSERT INTO otp_codes (email, code, expires_at)
      VALUES (${normalizedEmail}, ${otp}, ${expiresAt.toISOString()})
    `;

    // Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Admin Panel <onboarding@resend.dev>',
      to: normalizedEmail,
      subject: 'Your Login OTP',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Your Login OTP</h2>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f0f0f0; padding: 20px; text-align: center;">
            ${otp}
          </p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    });

    return res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Failed to send OTP', details: error?.message });
  }
}
