import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const sql = neon(process.env.DATABASE_URL || '');

        // Verify OTP
        const otpRecords = await sql`
      SELECT id, code, expires_at FROM otp_codes
      WHERE email = ${normalizedEmail} AND code = ${otp} AND used = false AND expires_at > NOW()
      ORDER BY id DESC LIMIT 1
    `;

        if (otpRecords.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        await sql`UPDATE otp_codes SET used = true WHERE id = ${otpRecords[0].id}`;

        // Get or create user
        let users = await sql`SELECT id, email FROM admin_users WHERE email = ${normalizedEmail}`;

        if (users.length === 0) {
            const result = await sql`
        INSERT INTO admin_users (email) VALUES (${normalizedEmail}) RETURNING id, email
      `;
            users = result;
        }

        const user = users[0];
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        return res.status(200).json({ success: true, token, user: { id: user.id, email: user.email } });
    } catch (error: any) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error?.message });
    }
}
