import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const WHITELIST = ['soumik15630m@gmail.com', 'gsoumik2005@outlook.com'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password, mobile } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (!WHITELIST.includes(normalizedEmail)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const sql = neon(process.env.DATABASE_URL || '');

        // Check if user already has password
        let users = await sql`SELECT id, password_hash FROM admin_users WHERE email = ${normalizedEmail}`;

        if (users.length > 0 && users[0].password_hash) {
            return res.status(400).json({ error: 'Password already set. Use login instead.' });
        }

        // Hash password and create/update user
        const passwordHash = await bcrypt.hash(password, 12);

        if (users.length === 0) {
            // Insert new user
            const result = await sql`
        INSERT INTO admin_users (email, password_hash, mobile)
        VALUES (${normalizedEmail}, ${passwordHash}, ${mobile || null})
        RETURNING id, email
      `;
            users = result;
        } else {
            // Update existing user
            await sql`
        UPDATE admin_users
        SET password_hash = ${passwordHash}, mobile = ${mobile || null}
        WHERE email = ${normalizedEmail}
      `;
            users = await sql`SELECT id, email FROM admin_users WHERE email = ${normalizedEmail}`;
        }

        const user = users[0];
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        return res.status(200).json({ success: true, token, user: { id: user.id, email: user.email } });
    } catch (error: any) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error?.message });
    }
}
