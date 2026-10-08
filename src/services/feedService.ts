/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task } from '../types';
import { getTaskCanonicalPath, slugify } from '../utils/slugify';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://freelahub.com.br';

/**
 * Generates dynamic XML Sitemap containing only active, indexable URLs with real lastmod.
 */
export function generateSitemapXml(tasks: Task[]): string {
  const now = new Date().toISOString().split('T')[0];

  // Static indexable routes
  const staticUrls = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily', lastmod: now },
    { loc: `${BASE_URL}/vagas`, priority: '0.9', changefreq: 'daily', lastmod: now },
    { loc: `${BASE_URL}/privacidade`, priority: '0.3', changefreq: 'monthly', lastmod: now },
    { loc: `${BASE_URL}/termos`, priority: '0.3', changefreq: 'monthly', lastmod: now },
  ];

  // Unique categories
  const categories = Array.from(new Set(tasks.map((t) => t.category).filter(Boolean)));
  const categoryUrls = categories.map((cat) => ({
    loc: `${BASE_URL}/categorias/${slugify(cat)}`,
    priority: '0.8',
    changefreq: 'daily',
    lastmod: now,
  }));

  // Unique cities with real tasks
  const cities = Array.from(new Set(tasks.map((t) => t.city).filter(Boolean))) as string[];
  const cityUrls = cities.map((city) => ({
    loc: `${BASE_URL}/local/sp/${slugify(city)}`,
    priority: '0.7',
    changefreq: 'daily',
    lastmod: now,
  }));

  // Active public tasks
  const activeTasks = tasks.filter((t) => t.status !== 'expirada');
  const taskUrls = activeTasks.map((t) => ({
    loc: `${BASE_URL}${getTaskCanonicalPath(t)}`,
    lastmod: t.updatedAt?.split('T')[0] || now,
    priority: '0.8',
    changefreq: 'daily',
  }));

  const allUrls = [...staticUrls, ...categoryUrls, ...cityUrls, ...taskUrls];

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allUrls.map((u) => {
      return `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
    }),
    '</urlset>',
  ];

  return xmlLines.join('\n');
}

/**
 * Generates public RSS 2.0 / Atom syndication feed for search engines and aggregators.
 */
export function generateRssXml(tasks: Task[]): string {
  const activeTasks = tasks.filter((t) => t.status !== 'expirada');
  const now = new Date().toUTCString();

  const items = activeTasks.map((t) => {
    const url = `${BASE_URL}${getTaskCanonicalPath(t)}`;
    const pubDate = t.postedDate?.includes('T') ? new Date(t.postedDate).toUTCString() : now;
    return `    <item>
      <title><![CDATA[${t.title} - R$ ${t.basePay}/h (${t.city || 'Brasil'})]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${t.description} Remuneração: R$ ${t.basePay}/h. Categoria: ${t.category}. Local: ${t.city || 'Em casa'}. Contato direto: ${t.contractorPhone || 'Ver no FreelaHub'}.]]></description>
      <category>${t.category}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FreelaHub - Oportunidades Freelancer e Tarefas Diárias</title>
    <link>${BASE_URL}</link>
    <description>Feed oficial de postagens e tarefas diárias para freelancers no Brasil com pagamento via PIX.</description>
    <language>pt-BR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>`;
}
