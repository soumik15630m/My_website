import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL || '');

        // Create tables
        await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        mobile VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

        await sql`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE
      )
    `;

        await sql`
      CREATE TABLE IF NOT EXISTS site_content (
        key VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

        // Seed whitelist users
        const whitelistEmails = ['soumik15630m@gmail.com', 'gsoumik2005@outlook.com'];
        for (const email of whitelistEmails) {
            await sql`
        INSERT INTO admin_users (email)
        VALUES (${email})
        ON CONFLICT (email) DO NOTHING
      `;
        }

        return res.status(200).json({ success: true, message: 'Database initialized successfully!' });
    } catch (error: any) {
        console.error('Init database error:', error);
        return res.status(500).json({
            error: 'Failed to initialize database',
            details: error?.message || 'Unknown error'
        });
    }
}
