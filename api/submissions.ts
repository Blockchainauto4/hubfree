/**
 * Vercel Serverless Function: /api/submissions
 * Connects with Vercel Postgres when env vars are present.
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
        const s = req.body;
        await sql`
          INSERT INTO submissions (
            id, task_id, task_title, freelancer_name, user_id,
            pix_key, pix_type, submitted_at, status,
            base_earned, bonus_earned, total_earned, video_file_name,
            resolution, fps
          ) VALUES (
            ${s.id}, ${s.taskId}, ${s.taskTitle}, ${s.freelancerName}, ${s.userId || null},
            ${s.pixKey}, ${s.pixType}, ${s.submittedAt}, ${s.status || 'approved'},
            ${s.baseEarned}, ${s.bonusEarned || 0}, ${s.totalEarned}, ${s.videoFileName || ''},
            ${s.resolution || '1080p'}, ${s.fps || 60}
          );
        `;

        // Increment slots_filled in tasks table
        await sql`
          UPDATE tasks
          SET slots_filled = slots_filled + 1
          WHERE id = ${s.taskId};
        `;

        return res.status(200).json({ success: true, submission: s });
      }

      const { rows } = await sql`
        SELECT * FROM submissions ORDER BY created_at DESC LIMIT 50;
      `;
      return res.status(200).json(rows);
    } catch (err: any) {
      console.warn('Vercel Postgres submissions error:', err.message);
    }
  }

  if (req.method === 'POST') {
    return res.status(200).json({ success: true, submission: req.body });
  }

  return res.status(200).json([]);
}
