import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL || '');

// Content types and their default values
const CONTENT_DEFAULTS: Record<string, any> = {
    profile: {
        name: "Alex V.",
        handle: "0x1A",
        role: "Systems Engineer",
        tagline: "Building high-performance systems with zero-cost abstractions.",
        location: "San Francisco, CA",
        availability: "Open to select contract work",
        email: "alex@example.com",
        github: "https://github.com/example",
        about: "I specialize in low-level systems programming..."
    },
    projects: [],
    achievements: [],
    notes: [],
    nav_items: [
        { id: 'home', label: '_home' },
        { id: 'projects', label: '_projects' },
        { id: 'achievements', label: '_achievements' },
        { id: 'notes', label: '_log' },
    ]
};

function verifyToken(token: string): { userId: number; email: string } | null {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        return decoded as { userId: number; email: string };
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

function getAuthToken(req: VercelRequest): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { type } = req.query;

    if (!type || typeof type !== 'string') {
        return res.status(400).json({ error: 'Content type is required' });
    }

    // GET - public, no auth needed
    if (req.method === 'GET') {
        try {
            const content = await sql`SELECT data FROM site_content WHERE key = ${type}`;

            if (content.length === 0) {
                return res.status(200).json({
                    data: CONTENT_DEFAULTS[type] || null,
                    isDefault: true
                });
            }

            return res.status(200).json({
                data: content[0].data,
                isDefault: false
            });
        } catch (error: any) {
            console.error('Get content error:', error);
            return res.status(200).json({
                data: CONTENT_DEFAULTS[type] || null,
                isDefault: true,
                dbError: true
            });
        }
    }

    // PUT/POST - requires auth
    if (req.method === 'PUT' || req.method === 'POST') {
        const token = getAuthToken(req);
        if (!token) {
            return res.status(401).json({ error: 'Authentication required - no token provided' });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return res.status(401).json({ error: 'Invalid token - verification failed' });
        }

        try {
            const { data } = req.body;

            if (data === undefined) {
                return res.status(400).json({ error: 'Data is required' });
            }

            await sql`
        INSERT INTO site_content (key, data, updated_at)
        VALUES (${type}, ${JSON.stringify(data)}, NOW())
        ON CONFLICT (key) DO UPDATE
        SET data = ${JSON.stringify(data)}, updated_at = NOW()
      `;

            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Update content error:', error);
            return res.status(500).json({ error: 'Internal server error', details: error?.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
