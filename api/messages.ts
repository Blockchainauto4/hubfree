/**
 * Vercel Serverless Function: /api/messages
 * Saves and retrieves chat conversations with Gemini or WhatsApp Support
 * Backed by Vercel Postgres (@vercel/postgres) with local fallback.
 */

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const conversationId = req.query?.conversationId || req.body?.conversationId || 'default';

  if (process.env.POSTGRES_URL) {
    try {
      const { sql } = await import('@vercel/postgres');

      if (req.method === 'POST') {
        const { id, sender, text, userId } = req.body;
        const msgId = id || 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

        await sql`
          INSERT INTO chat_messages (id, conversation_id, user_id, sender, text)
          VALUES (${msgId}, ${conversationId}, ${userId || null}, ${sender}, ${text});
        `;

        return res.status(200).json({ success: true, message: { id: msgId, conversationId, sender, text } });
      }

      // GET - Fetch conversation messages in chronological order
      const { rows } = await sql`
        SELECT 
          id,
          conversation_id as "conversationId",
          sender,
          text,
          to_char(created_at, 'HH24:MI') as time
        FROM chat_messages
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at ASC
        LIMIT 50;
      `;

      return res.status(200).json(rows);
    } catch (dbErr: any) {
      console.warn('Vercel Postgres chat_messages query notice:', dbErr.message);
    }
  }

  // Graceful fallback for local development or when database is provisioning
  if (req.method === 'POST') {
    return res.status(200).json({ success: true, message: req.body });
  }

  return res.status(200).json([]);
}
