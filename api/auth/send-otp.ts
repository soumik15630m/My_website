import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';
import { generateOTP } from '../lib/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if email is in whitelist
        const users = await sql`
      SELECT id, email
      FROM admin_users
      WHERE email = ${email.toLowerCase()}
    `;

        if (users.length === 0) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Mark any existing OTPs as used
        await sql`
      UPDATE otp_codes
      SET used = true
      WHERE email = ${email.toLowerCase()} AND used = false
    `;

        // Save new OTP
        await sql`
      INSERT INTO otp_codes (email, code, expires_at)
      VALUES (${email.toLowerCase()}, ${otp}, ${expiresAt.toISOString()})
    `;

        // Send email via Resend
        await resend.emails.send({
            from: 'Portfolio Admin <onboarding@resend.dev>',
            to: email,
            subject: 'Your Login OTP',
            html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Login OTP</h2>
          <p style="color: #666;">Your one-time password is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      `
        });

        return res.status(200).json({
            success: true,
            message: 'OTP sent to your email'
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        return res.status(500).json({ error: 'Failed to send OTP' });
    }
}
