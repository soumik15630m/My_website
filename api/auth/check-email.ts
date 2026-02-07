import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';

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
      SELECT id, email, password_hash, mobile
      FROM admin_users
      WHERE email = ${email.toLowerCase()}
    `;

        if (users.length === 0) {
            return res.status(403).json({
                error: 'Access denied. This email is not authorized.',
                authorized: false
            });
        }

        const user = users[0];
        const hasPassword = !!user.password_hash;
        const hasMobile = !!user.mobile;

        return res.status(200).json({
            authorized: true,
            hasPassword,
            hasMobile,
            email: user.email
        });
    } catch (error) {
        console.error('Check email error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
