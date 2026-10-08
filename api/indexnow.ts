/**
 * Vercel Serverless Function: /api/indexnow
 * Submits URL list to the IndexNow protocol on behalf of FreelaHub.
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

  const { urls } = req.body || {};
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid "urls" array.' });
  }

  const host = process.env.APP_HOST || 'freelahub.com.br';
  const key = process.env.INDEXNOW_KEY || 'freelahub2026indexnowkey';

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls,
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    return res.status(200).json({
      success: true,
      statusCode: response.status,
      submittedUrls: urls.length,
      host,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to dispatch IndexNow request.',
    });
  }
}
