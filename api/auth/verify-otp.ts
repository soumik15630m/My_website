import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';
import { generateToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        // Get user
        const users = await sql`
      SELECT id, email
      FROM admin_users
      WHERE email = ${email.toLowerCase()}
    `;

        if (users.length === 0) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const user = users[0];

        // Verify OTP
        const otpRecords = await sql`
      SELECT id, code, expires_at
      FROM otp_codes
      WHERE email = ${email.toLowerCase()}
        AND code = ${otp}
        AND used = false
        AND expires_at > NOW()
      ORDER BY id DESC
      LIMIT 1
    `;

        if (otpRecords.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        await sql`
      UPDATE otp_codes
      SET used = true
      WHERE id = ${otpRecords[0].id}
    `;

        // Generate JWT token
        const token = generateToken({ userId: user.id, email: user.email });

        return res.status(200).json({
            success: true,
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
