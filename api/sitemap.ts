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
  { id: 'task-home-1', title: 'Manutenção e projetos da casa', city: 'São Paulo', category: 'Manutenção e projetos da casa', updatedAt: '2026-10-07' },
  { id: 'task-home-2', title: 'Serviços automotivos e elétrica veicular', city: 'São Paulo', category: 'Serviços automotivos', updatedAt: '2026-10-07' },
  { id: 'task-1', title: 'Montagem de Quadro de Distribuição Elétrica Trifásica', city: 'São Paulo', category: 'Elétrica', updatedAt: '2026-10-07' },
  { id: 'task-2', title: 'Troca de Pastilhas e Sangria de Freio ABS', city: 'São Paulo', category: 'Mecânica', updatedAt: '2026-10-07' },
  { id: 'task-3', title: 'Instalação de Tomadas e Cabeamento de Rede', city: 'Campinas', category: 'Elétrica', updatedAt: '2026-10-07' },
  { id: 'task-4', title: 'Preparo e Sovagem de Pão Rústico de Fermentação Natural', city: 'São Paulo', category: 'Culinária', updatedAt: '2026-10-07' },
  { id: 'task-5', title: 'Montagem e Teste de Bancada com Microcontrolador', city: 'Santos', category: 'Tecnologia', updatedAt: '2026-10-07' },
  { id: 'task-6', title: 'Assentamento de Porcelanato Retificado com Nivelador', city: 'Santo André', category: 'Construção', updatedAt: '2026-10-07' },
  { id: 'task-7', title: 'Pintura & Acabamentos Residenciais', city: 'São Bernardo do Campo', category: 'Construção', updatedAt: '2026-10-07' },
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
