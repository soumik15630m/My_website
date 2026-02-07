import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeDatabase } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await initializeDatabase();
        return res.status(200).json({ success: true, message: 'Database initialized' });
    } catch (error) {
        console.error('Init database error:', error);
        return res.status(500).json({ error: 'Failed to initialize database' });
    }
}
