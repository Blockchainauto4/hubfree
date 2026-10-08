/**
 * Vercel Serverless Function: /api/sitemap
 * Generates dynamic, fully compliant XML sitemap directly from Postgres/NeonDB
 * with canonical URLs, lastmod, active categories, real cities, and institutional pages.
 */

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const FALLBACK_TASKS = [
  { id: 'vaga-barman-vila-clementino-1010', title: 'Barman para Evento - Vila Clementino (Próximo Pq. Ibirapuera)', city: 'São Paulo', category: 'Eventos', updatedAt: '2026-10-08' },
  { id: 'vaga-seguranca-jurubatuba-1010', title: 'Segurança Masculino - Zona Sul (Jurubatuba)', city: 'São Paulo', category: 'Segurança', updatedAt: '2026-10-08' },
  { id: 'vaga-promotora-posto-graal-bandeirantes', title: 'Promotora / Recepção de Evento - Posto Graal (Rod. dos Bandeirantes)', city: 'São Paulo', category: 'Eventos', updatedAt: '2026-10-08' },
];

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  const baseUrl = process.env.APP_URL || 'https://freelahub.com.br';
  const now = new Date().toISOString().split('T')[0];

  let rawTasks: Array<{ id: string; title: string; city?: string; category?: string; updatedAt?: string }> = [];

  if (process.env.POSTGRES_URL) {
    try {
      const { sql } = await import('@vercel/postgres');
      // Only include active, non-expired tasks in sitemap
      const { rows } = await sql`
        SELECT 
          id, 
          title, 
          city, 
          category,
          created_at as "updatedAt"
        FROM tasks
        WHERE (expires_at IS NULL OR expires_at > NOW())
          AND (slots_filled < slots_total)
        ORDER BY created_at DESC;
      `;
      if (Array.isArray(rows) && rows.length > 0) {
        rawTasks = rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          city: r.city || 'São Paulo',
          category: r.category || 'Serviços',
          updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString().split('T')[0] : now,
        }));
      }
    } catch (e) {
      console.warn('Postgres query fallback in sitemap:', e);
    }
  }

  // Fallback to initial seed tasks if database not configured
  if (rawTasks.length === 0) {
    rawTasks = FALLBACK_TASKS;
  }

  // 1. Task URLs with canonical slug
  const taskUrls = rawTasks.map((t) => {
    const titleSlug = slugify(t.title);
    const citySlug = slugify(t.city || 'sao-paulo');
    const path = `/vagas/${titleSlug}-${citySlug}-${t.id}`;
    return `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${t.updatedAt || now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // 2. Category URLs
  const uniqueCategories = Array.from(new Set(rawTasks.map((t) => t.category).filter(Boolean)));
  const categoryUrls = uniqueCategories.map((cat) => {
    return `  <url>
    <loc>${baseUrl}/categorias/${slugify(cat!)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // 3. City URLs
  const uniqueCities = Array.from(new Set(rawTasks.map((t) => t.city).filter(Boolean)));
  const cityUrls = uniqueCities.map((city) => {
    return `  <url>
    <loc>${baseUrl}/local/sp/${slugify(city!)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // 4. Static core pages
  const staticUrls = [
    `  <url><loc>${baseUrl}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `  <url><loc>${baseUrl}/vagas</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`,
    `  <url><loc>${baseUrl}/privacidade</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.3</priority></url>`,
    `  <url><loc>${baseUrl}/termos</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.3</priority></url>`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join('\n')}
${categoryUrls.join('\n')}
${cityUrls.join('\n')}
${taskUrls.join('\n')}
</urlset>`;

  return res.status(200).send(xml);
}
