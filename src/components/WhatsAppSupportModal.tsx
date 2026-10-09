/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ExternalLink, ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';

const SUPPORT_WHATSAPP_NUMBER = '5511991271914';
const SUPPORT_WHATSAPP_DISPLAY = '+55 (11) 99127-1914';
const OFFICIAL_WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029VbDEoz1CBtx6PIkq4p1t';

export const WhatsAppSupportModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const getWhatsAppUrl = (customText?: string) => {
    const text = encodeURIComponent(
      customText || 'Olá! Vim pelo FreelaHub e gostaria de suporte com a plataforma e com as vagas.'
    );
    return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${text}`;
  };

  const supportTopics = [
    {
      title: 'Dúvidas sobre Vagas de Hoje',
      subtitle: 'Barman, Segurança e Promotora',
      message: 'Olá! Gostaria de tirar dúvidas sobre as vagas disponíveis hoje no FreelaHub.',
    },
    {
      title: 'Missões & Roda TikTok',
      subtitle: 'Como liberar o contato de contratantes por 24h',
      message: 'Olá! Preciso de ajuda com a missão da roda do TikTok para liberar os contatos dos contratantes.',
    },
    {
      title: 'Pagamento e Saque PIX',
      subtitle: 'Comprovantes, liberação e recebimento',
      message: 'Olá! Tenho uma dúvida sobre recebimento e saque via PIX no FreelaHub.',
    },
    {
      title: 'Falar com Atendente Humano',
      subtitle: 'Atendimento direto com nossa equipe',
      message: 'Olá! Gostaria de falar com um atendente humano do FreelaHub agora.',
    },
  ];

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl shadow-[#25D366]/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Abrir Suporte WhatsApp"
        >
          {isOpen ? (
            <X className="w-6 h-6 sm:w-7 sm:h-7" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-white" aria-hidden="true">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.67-1.39 1.27-1.92 1.35-.5.08-1.14.12-3.69-.93-3.26-1.34-5.35-4.66-5.51-4.88-.16-.22-1.32-1.75-1.32-3.34 0-1.59.83-2.37 1.13-2.69.29-.32.65-.4.87-.4.21 0 .43.01.62.02.2.01.47-.08.73.55.27.65.92 2.24 1 2.4.08.16.13.35.03.56-.11.22-.16.35-.32.54-.16.19-.34.42-.48.56-.16.16-.33.33-.14.65.19.32.84 1.38 1.8 2.24 1.24 1.1 2.28 1.45 2.61 1.61.32.16.51.13.7-.08.19-.22.81-.95 1.03-1.27.22-.32.43-.27.73-.16.29.11 1.87.88 2.19 1.04.32.16.54.24.62.38.08.14.08.81-.16 1.48z" />
            </svg>
          )}
        </button>
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 mt-1 drop-shadow-md">
          Suporte
        </span>
      </div>

      {/* WhatsApp Support Direct Modal */}
      {isOpen && (
        <div className="fixed bottom-18 right-3 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm rounded-3xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#128C7E] px-4 py-3.5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
                FH
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">Suporte Oficial FreelaHub</div>
                <div className="text-[11px] text-emerald-100 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse" />
                  {SUPPORT_WHATSAPP_DISPLAY}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white cursor-pointer transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Notice */}
          <div className="p-4 bg-slate-950 space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-white">Atendimento 100% pelo WhatsApp</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Todo suporte, esclarecimento de dúvidas e confirmação de vagas são realizados diretamente no WhatsApp oficial da nossa equipe.
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 transition-all cursor-pointer text-center"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>Chamar no WhatsApp (+55 11 99127-1914)</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Official Channel Link */}
            <a
              href={OFFICIAL_WHATSAPP_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
            >
              <span>Canal Oficial de Vagas no WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {/* Quick Topic Selection */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Escolha o assunto para abrir no WhatsApp:
              </span>

              <div className="space-y-1.5">
                {supportTopics.map((topic, idx) => (
                  <a
                    key={idx}
                    href={getWhatsAppUrl(topic.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-white/5 hover:border-emerald-500/30 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-[#25D366] transition-colors truncate">
                        {topic.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {topic.subtitle}
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-slate-600 group-hover:text-[#25D366] shrink-0 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="px-4 py-2.5 bg-slate-950 border-t border-white/10 text-[10px] text-slate-400 text-center">
            Resposta rápida de segunda a domingo das 08h às 23h.
          </div>
        </div>
      )}
    </>
  );
};
