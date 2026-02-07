const API_BASE = '/api';

export async function checkEmail(email: string) {
    const res = await fetch(`${API_BASE}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return res.json();
}

export async function register(email: string, password: string, mobile?: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mobile }),
    });
    return res.json();
}

export async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
}

export async function sendOTP(email: string) {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return res.json();
}

export async function verifyOTP(email: string, otp: string) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    });
    return res.json();
}

export async function getContent(type: string) {
    const res = await fetch(`${API_BASE}/content/${type}`);
    return res.json();
}

export async function updateContent(type: string, data: any, token: string) {
    const res = await fetch(`${API_BASE}/content/${type}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ data }),
    });
    return res.json();
}

export async function initDatabase() {
    const res = await fetch(`${API_BASE}/init-db`, { method: 'POST' });
    return res.json();
}
