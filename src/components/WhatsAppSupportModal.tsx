import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export const WhatsAppSupportModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Olá! Sou o atendente da equipe FreelasHub. Precisa de ajuda com o bônus em vídeo, suporte de cabeça ou saque via PIX?',
      time: '11:00',
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userText = message.trim();
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setChatLog((prev) => [...prev, { sender: 'user', text: userText, time: nowTime }]);
    setMessage('');

    // Automated smart agent response
    setTimeout(() => {
      let botResponse = 'Perfeito! Nossa equipe técnica confere todos os envios de vídeo em menos de 2 horas. Para receber o bônus integral, lembre-se de gravar em 1080p e manter ambas as mãos visíveis.';
      const lower = userText.toLowerCase();

      if (lower.includes('pix') || lower.includes('saque') || lower.includes('pagamento')) {
        botResponse = 'Os saques PIX são processados diretamente na sua chave cadastrada (CPF, e-mail ou celular). Assim que o vídeo da tarefa diária for aprovado, o saldo fica 100% liberado para saque imediato!';
      } else if (lower.includes('bonus') || lower.includes('bônus')) {
        botResponse = 'O Bônus em Vídeo é concedido em tarefas que solicitam entrega no mesmo dia com qualidade Full HD (1080p60) e enquadramento em primeira pessoa (POV). Você pode faturar até +R$ 35 extras por tarefa!';
      } else if (lower.includes('suporte') || lower.includes('cabeça') || lower.includes('camera') || lower.includes('celular')) {
        botResponse = 'Para gravar em primeira pessoa, recomendamos um suporte elástico de cabeça (head-mount) ou peitoral. Qualquer celular com câmera padrão de 1080p é compatível.';
      }

      setChatLog((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 700);
  };

  return (
    <>
      {/* Floating Button exactly matching screenshot */}
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

      {/* Interactive Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-2xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#128C7E] px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                FH
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">Suporte FreelasHub</div>
                <div className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse" />
                  Online agora · Resposta rápida
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-white/10 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="p-4 h-72 overflow-y-auto space-y-3 bg-[#0b1014] text-xs">
            {chatLog.map((chat, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${
                  chat.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl leading-relaxed ${
                    chat.sender === 'user'
                      ? 'bg-[#005c4b] text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'
                  }`}
                >
                  {chat.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 px-1 font-mono">
                  {chat.time}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Preset Buttons */}
          <div className="p-2 bg-slate-950/80 border-t border-white/5 flex gap-1.5 overflow-x-auto text-[10px]">
            <button
              type="button"
              onClick={() => setMessage('Como funciona o bônus em vídeo?')}
              className="whitespace-nowrap px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
            >
              Bônus em Vídeo?
            </button>
            <button
              type="button"
              onClick={() => setMessage('Quando cai o PIX?')}
              className="whitespace-nowrap px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
            >
              Prazo do PIX?
            </button>
            <button
              type="button"
              onClick={() => setMessage('Qual suporte de celular usar?')}
              className="whitespace-nowrap px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
            >
              Suporte de Celular?
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#00e575] hover:bg-[#00ff87] text-slate-950 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
