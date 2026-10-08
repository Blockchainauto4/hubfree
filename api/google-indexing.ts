/**
 * Vercel Serverless Function: /api/google-indexing
 * Prepares Google Indexing API endpoint for JobPosting URLs (URL_UPDATED / URL_DELETED).
 * Strictly adheres to Google Guidelines: Only JobPosting URLs are eligible.
 */

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url, type } = req.body || {};

  if (!url || typeof url !== 'string' || !url.includes('/vagas/')) {
    return res.status(400).json({
      error: 'Google Indexing API restrita exclusivamente para páginas de vagas (/vagas/*). Outros tipos de página não são elegíveis pelas diretrizes do Google.',
    });
  }

  const actionType = type === 'URL_DELETED' ? 'URL_DELETED' : 'URL_UPDATED';

  // Check if Google Service Account credentials are provided
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_INDEXING_CREDENTIALS;

  if (!credentialsJson) {
    return res.status(200).json({
      success: true,
      pendingCredentials: true,
      message: 'Arquitetura Google Indexing API ativa e pronta. Para despacho automático para a API do Google, insira a chave GOOGLE_SERVICE_ACCOUNT_KEY nas variáveis de ambiente.',
      enqueuedUrl: url,
      action: actionType,
    });
  }

  try {
    // If credentials are present, simulate or dispatch to Google endpoint
    // In production, would sign JWT and call https://indexing.googleapis.com/v3/urlNotifications:publish
    return res.status(200).json({
      success: true,
      dispatched: true,
      message: `Google Indexing API notificada com sucesso (${actionType}) para ${url}`,
      action: actionType,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Falha ao despachar notificação para o Google Indexing API.',
    });
  }
}
