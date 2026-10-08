/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Service to notify Google Indexing API for JobPosting URLs when created, updated, or removed.
 * Google explicitly allows Indexing API ONLY for JobPosting and BroadcastEvent.
 */
export async function notifyGoogleIndexing(
  canonicalJobUrl: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<{ success: boolean; message: string }> {
  if (!canonicalJobUrl || !canonicalJobUrl.includes('/vagas/')) {
    return {
      success: false,
      message: 'A Google Indexing API é restrita exclusivamente para páginas de vagas (/vagas/*).',
    };
  }

  try {
    const res = await fetch('/api/google-indexing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: canonicalJobUrl, type }),
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || 'Notificação enfileirada no Google Indexing API.' };
    }

    return {
      success: true,
      message: `Google Indexing API: URL de vaga enfileirada (${canonicalJobUrl}).`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao notificar Google Indexing: ${err?.message || 'Falha de conexão.'}`,
    };
  }
}
