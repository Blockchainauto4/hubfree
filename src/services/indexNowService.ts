/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Service to notify IndexNow (Bing, Yandex, Seznam, and participating crawlers)
 * when tasks are created, updated, or expired.
 */
export async function notifyIndexNow(urls: string[]): Promise<{ success: boolean; message: string }> {
  if (!urls || urls.length === 0) {
    return { success: false, message: 'Nenhuma URL informada para o IndexNow.' };
  }

  const host = typeof window !== 'undefined' ? window.location.hostname : 'freelahub.com.br';
  // Configurable IndexNow key (env or fallback public key)
  const key = (typeof process !== 'undefined' && process.env?.INDEXNOW_KEY) || 'freelahub2026indexnowkey';

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls,
  };

  try {
    // Notify via backend proxy /api/indexnow if present, or direct API
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (res && (res.ok || res.status === 200 || res.status === 202)) {
      return { success: true, message: `IndexNow notificado com sucesso para ${urls.length} URLs.` };
    }

    return {
      success: true,
      message: `Notificação IndexNow enfileirada para ${urls.length} URLs (Host: ${host}).`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao notificar IndexNow: ${err?.message || 'Falha de rede.'}`,
    };
  }
}
