import { neon } from '@neondatabase/serverless';

// Create a SQL query function using the connection string
const databaseUrl = process.env.DATABASE_URL || '';
export const sql = neon(databaseUrl);

// Initialize database tables
export async function initializeDatabase() {
    // Create admin_users table
    await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      mobile VARCHAR(20),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

    // Create otp_codes table
    await sql`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE
    )
  `;

    // Create site_content table
    await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      key VARCHAR(50) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

    // Seed whitelist users if not exists
    const whitelistEmails = [
        'soumik15630m@gmail.com',
        'gsoumik2005@outlook.com'
    ];

    for (const email of whitelistEmails) {
        await sql`
      INSERT INTO admin_users (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
    `;
    }
}
