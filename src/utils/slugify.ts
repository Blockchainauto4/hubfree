/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Normalizes text to an SEO-friendly URL slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w-]+/g, '') // remove all non-word chars except -
    .replace(/--+/g, '-') // replace multiple - with single -
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, ''); // trim - from end of text
}

/**
 * Builds canonical URL path for a task:
 * /vagas/:slug (e.g. /vagas/manutencao-e-projetos-da-casa-sao-paulo-task-home-1)
 */
export function getTaskCanonicalPath(task: { id: string; title: string; city?: string }): string {
  const titleSlug = slugify(task.title);
  const citySlug = task.city ? slugify(task.city) : 'brasil';
  return `/vagas/${titleSlug}-${citySlug}-${task.id}`;
}

/**
 * Extracts task ID from a /vagas/:slug parameter.
 */
export function extractTaskIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  // Match id pattern like 'task-home-1', 'task-1', '12345'
  const match = slug.match(/(task-[a-z0-9-]+|[0-9a-f-]{8,36}|[0-9]+)$/i);
  return match ? match[1] : slug;
}
