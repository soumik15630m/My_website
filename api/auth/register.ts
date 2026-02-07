import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';
import { hashPassword, generateToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password, mobile } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if email is in whitelist
        const users = await sql`
      SELECT id, email, password_hash
      FROM admin_users
      WHERE email = ${email.toLowerCase()}
    `;

        if (users.length === 0) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const user = users[0];

        // Check if password already exists
        if (user.password_hash) {
            return res.status(400).json({ error: 'Password already set. Please login instead.' });
        }

        // Hash and save password
        const passwordHash = await hashPassword(password);

        await sql`
      UPDATE admin_users
      SET password_hash = ${passwordHash}, mobile = ${mobile || null}
      WHERE id = ${user.id}
    `;

        // Generate JWT token
        const token = generateToken({ userId: user.id, email: user.email });

        return res.status(200).json({
            success: true,
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
