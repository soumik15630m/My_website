import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const sql = neon(process.env.DATABASE_URL || '');

        // Find user
        const users = await sql`
      SELECT id, email, password_hash FROM admin_users WHERE email = ${normalizedEmail}
    `;

        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = users[0];

        if (!user.password_hash) {
            return res.status(400).json({ error: 'Password not set. Please register first.' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        return res.status(200).json({ success: true, token, user: { id: user.id, email: user.email } });
    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error?.message });
    }
}
