/**
 * Vercel Serverless Function: /api/gemini
 * AI Assistant for FreelaHub powered by Google Gemini (gemini-3.8-flash)
 */

import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client
const ai = new GoogleGenAI();

const SYSTEM_INSTRUCTION = `
Você é o Assistente Oficial FreelaHub ("Filmou Ganhou"), especialista em microtarefas freelancers e captação de dados em vídeo em primeira pessoa (POV).
Seu objetivo é ajudar freelancers e empresas a terem o máximo de sucesso na plataforma.

Diretrizes de resposta:
1. Seja ágil, direto, encorajador e profissional.
2. Explique como funciona o "Filmou Ganhou":
   - Freelancers usam o próprio celular fixado na cabeça (head-mount) ou peito.
   - Gravam atividades profissionais normais na oficina, obra ou em casa.
   - Ganham o valor base (ex: R$ 50/h) + BÔNUS EM VÍDEO (até +R$ 35) entregando em 1080p a 60fps no mesmo dia.
   - O dinheiro cai direto via PIX.
3. Dicas práticas de gravação POV:
   - Celular firme, ambas as mãos visíveis executando a tarefa.
   - Foco travado e iluminação sem sombras pesadas.
   - Sem corte nas mãos nos momentos críticos da tarefa.
   - Não exibir dados sigilosos ou marcas protegidas.
4. Para empresas:
   - Podem cadastrar demandas de vídeo para alimentar datasets de IA e robótica com auditoria em até 24h.
5. Responda em português brasileiro de forma limpa e objetiva.
`;

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const { prompt, history, customSystemInstruction, temperature, model } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'O campo prompt é obrigatório.' });
    }

    const contents: any[] = [];

    // Include conversation history if provided
    if (Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const activeSystemInstruction = (customSystemInstruction && typeof customSystemInstruction === 'string' && customSystemInstruction.trim().length > 0)
      ? customSystemInstruction
      : SYSTEM_INSTRUCTION;

    const activeTemperature = typeof temperature === 'number' ? Math.min(Math.max(temperature, 0), 1) : 0.7;
    const activeModel = model || 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model: activeModel,
      contents,
      config: {
        systemInstruction: activeSystemInstruction,
        temperature: activeTemperature,
      },
    });

    const reply = response.text || 'Desculpe, não consegui processar a resposta no momento.';
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: 'Erro ao processar com Gemini AI.',
      details: error.message || String(error),
      fallbackReply: 'O assistente FreelaHub recomenda gravar em 1080p60 com suporte de cabeça para garantir seu bônus de até +R$ 35 via PIX.',
    });
  }
}
