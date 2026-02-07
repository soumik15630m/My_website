import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';
import { comparePassword, generateToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get user
        const users = await sql`
      SELECT id, email, password_hash
      FROM admin_users
      WHERE email = ${email.toLowerCase()}
    `;

        if (users.length === 0) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const user = users[0];

        if (!user.password_hash) {
            return res.status(400).json({ error: 'No password set. Please register first.' });
        }

        // Verify password
        const isValid = await comparePassword(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate JWT token
        const token = generateToken({ userId: user.id, email: user.email });

        return res.status(200).json({
            success: true,
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
