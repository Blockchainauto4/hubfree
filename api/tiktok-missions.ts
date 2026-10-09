/**
 * Vercel Serverless Function: /api/tiktok-missions
 * Manages the 3 TikTok missions and persists 24-hour unlocks in Postgres.
 */

const DEFAULT_MISSIONS = [
  {
    id: 'tiktok-mission-roda',
    title: 'Gire a Roda no TikTok e Ganhe Recompensas',
    subtitle: 'Missão Principal • Libera Botão de Contato com Contratante (24h)',
    description: 'Acesse o TikTok oficial, gire a roda da sorte premiada e desbloqueie o botão para falar direto no WhatsApp e ver telefones de todos os contratantes por 24 horas.',
    link: 'https://www.tiktok.com/d/1/ZS9DgKjpR7ppT-MOm13/',
    rewardBadge: '🎁 Desbloqueio Oficial 24h',
    iconType: 'wheel',
    buttonLabel: 'Girar a Roda no TikTok',
    isActive: true,
    order: 1,
  },
  {
    id: 'tiktok-mission-video',
    title: 'Assistir Vídeo Oficial das Vagas no TikTok',
    subtitle: 'Guia Rápido de Gravação POV 1080p & Pagamento PIX',
    description: 'Assista às instruções do TikTok sobre como comprovar sua participação nas tarefas freelancer e garantir o pagamento via PIX no término do serviço.',
    link: 'https://www.tiktok.com/d/1/ZS9DgKjpR7ppT-MOm13/',
    rewardBadge: '⚡ Passe Diário Ativo',
    iconType: 'video',
    buttonLabel: 'Abrir Vídeo no TikTok',
    isActive: true,
    order: 2,
  },
  {
    id: 'tiktok-mission-compartilhar',
    title: 'Compartilhar a Roda do TikTok com um Amigo',
    subtitle: 'Acesso VIP & Renovação Prioritária',
    description: 'Convide outros freelancers e amigos para girar a roda e receber notificações de novas vagas e bônus em primeira mão.',
    link: 'https://www.tiktok.com/d/1/ZS9DgKjpR7ppT-MOm13/',
    rewardBadge: '⭐ Renovação 24h',
    iconType: 'share',
    buttonLabel: 'Compartilhar no TikTok',
    isActive: true,
    order: 3,
  },
];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // If Postgres is configured
  if (process.env.POSTGRES_URL) {
    try {
      const { sql } = await import('@vercel/postgres');

      // Auto-create table if needed
      await sql`
        CREATE TABLE IF NOT EXISTS tiktok_unlocks (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(128) NOT NULL,
          mission_id VARCHAR(128) NOT NULL,
          unlocked_at BIGINT NOT NULL,
          expires_at BIGINT NOT NULL,
          user_email VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      if (req.method === 'POST') {
        const { sessionId, missionId, unlockedAt, expiresAt, userEmail } = req.body || {};
        await sql`
          INSERT INTO tiktok_unlocks (session_id, mission_id, unlocked_at, expires_at, user_email)
          VALUES (
            ${sessionId || 'anon'},
            ${missionId || 'tiktok-mission-roda'},
            ${unlockedAt || Date.now()},
            ${expiresAt || Date.now() + 24 * 3600 * 1000},
            ${userEmail || null}
          );
        `;
        return res.status(200).json({
          success: true,
          expiresAt: expiresAt || Date.now() + 24 * 3600 * 1000,
          message: 'Acesso às vagas liberado por 24 horas no banco de dados.',
        });
      }

      if (req.method === 'GET') {
        const sessionId = req.query?.sessionId;
        let userUnlock = null;
        if (sessionId) {
          const { rows: unlockRows } = await sql`
            SELECT unlocked_at, expires_at, mission_id 
            FROM tiktok_unlocks 
            WHERE session_id = ${sessionId} 
            ORDER BY id DESC 
            LIMIT 1;
          `;
          if (unlockRows && unlockRows.length > 0) {
            userUnlock = unlockRows[0];
          }
        }

        const { rows: stats } = await sql`
          SELECT COUNT(*) as total_unlocks FROM tiktok_unlocks;
        `;
        return res.status(200).json({
          success: true,
          missions: DEFAULT_MISSIONS,
          totalUnlocks: Number(stats[0]?.total_unlocks || 0),
          userUnlock,
        });
      }
    } catch (dbErr: any) {
      console.warn('Postgres notice on tiktok-missions:', dbErr.message);
    }
  }

  // Fallback for local/client preview mode
  if (req.method === 'POST') {
    const { expiresAt } = req.body || {};
    return res.status(200).json({
      success: true,
      expiresAt: expiresAt || Date.now() + 24 * 3600 * 1000,
      message: 'Acesso liberado por 24 horas.',
    });
  }

  return res.status(200).json({
    success: true,
    missions: DEFAULT_MISSIONS,
    totalUnlocks: 48,
  });
}
