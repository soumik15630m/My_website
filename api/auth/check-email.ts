import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const WHITELIST = ['soumik15630m@gmail.com', 'gsoumik2005@outlook.com'];

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

        // Check whitelist first
        if (!WHITELIST.includes(normalizedEmail)) {
            return res.status(403).json({ error: 'Access denied. Email not authorized.' });
        }

        const sql = neon(process.env.DATABASE_URL || '');

        // Check if user exists and has password set
        const users = await sql`
      SELECT id, email, password_hash, mobile FROM admin_users WHERE email = ${normalizedEmail}
    `;

        if (users.length === 0) {
            // User is whitelisted but not in DB yet - they can register
            return res.status(200).json({
                authorized: true,
                hasPassword: false,
                hasMobile: false,
                email: normalizedEmail
            });
        }

        const user = users[0];
        return res.status(200).json({
            authorized: true,
            hasPassword: !!user.password_hash,
            hasMobile: !!user.mobile,
            email: user.email
        });
    } catch (error: any) {
        console.error('Check email error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error?.message });
    }
}
