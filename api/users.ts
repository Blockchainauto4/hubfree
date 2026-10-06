/**
 * Vercel Serverless Function: /api/users
 * Handles freelancer and company profiles in Vercel Postgres.
 */

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (process.env.POSTGRES_URL) {
    try {
      const { sql } = await import('@vercel/postgres');

      if (req.method === 'POST') {
        const u = req.body;
        const userId = u.id || u.email.replace(/[.@]/g, '_');

        await sql`
          INSERT INTO users (
            id, name, email, role, pix_key, wallet_balance, updated_at
          ) VALUES (
            ${userId}, ${u.name}, ${u.email}, ${u.role || 'freelancer'},
            ${u.pixKey || null}, ${u.walletBalance || 0}, NOW()
          )
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            pix_key = COALESCE(EXCLUDED.pix_key, users.pix_key),
            wallet_balance = COALESCE(EXCLUDED.wallet_balance, users.wallet_balance),
            updated_at = NOW();
        `;
        return res.status(200).json({ success: true, user: u });
      }

      const { email } = req.query;
      if (email) {
        const { rows } = await sql`
          SELECT * FROM users WHERE email = ${email} LIMIT 1;
        `;
        return res.status(200).json(rows[0] || null);
      }
    } catch (err: any) {
      console.warn('Vercel Postgres users error:', err.message);
    }
  }

  if (req.method === 'POST') {
    return res.status(200).json({ success: true, user: req.body });
  }

  return res.status(200).json(null);
}
