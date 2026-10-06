import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, RotateCcw, Zap, HelpCircle, Sliders } from 'lucide-react';
import { AdminAssistantConfig } from '../types';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdminAssistantConfig;
  onOpenAdmin?: () => void;
}

interface Message {
  sender: 'user' | 'model';
  text: string;
  time: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  config,
  onOpenAdmin,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'model',
      text: config.welcomeMessage,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = config.quickPrompts && config.quickPrompts.length > 0
    ? config.quickPrompts
    : [
        'Como garantir o bônus de 1080p60fps?',
        'Qual suporte de celular usar na oficina?',
        'Dicas para evitar cortes nas mãos',
        'Quanto recebo por 2 horas de gravação?',
      ];

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { sender: 'user', text: prompt, time: now };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          history: messages.slice(-6), // Send recent context
          customSystemInstruction: config.systemInstruction,
          temperature: config.temperature,
          model: config.model,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.reply || data.fallbackReply;
        setMessages((prev) => [
          ...prev,
          {
            sender: 'model',
            text: replyText,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('Falha na resposta do assistente');
      }
    } catch (err) {
      // Intelligent fallback answer if local dev server or proxy is unreachable
      let fallback = 'Para garantir 100% de aprovação e o bônus em vídeo de até +R$ 35, grave com suporte elástico na testa (head-mount), resolução travada em 1080p a 60 quadros por segundo, boa luz e ambas as mãos visíveis sem cortes bruscos!';
      const p = prompt.toLowerCase();
      if (p.includes('pix') || p.includes('saque') || p.includes('quanto') || p.includes('faturar')) {
        fallback = 'O valor base é pago a R$ 50/h + Bônus em Vídeo de R$ 15 a R$ 35 por clipe diário aprovado. Gravando 2h por dia com bônus, você fatura cerca de R$ 130 a R$ 160 por dia, liberados direto na sua chave PIX!';
      } else if (p.includes('suporte') || p.includes('cabeça') || p.includes('celular') || p.includes('oficina')) {
        fallback = 'O mais recomendado é o suporte elástico de cabeça (head-mount) com ângulo ajustável para baixo (olhando para as mãos). Para oficinas pesadas ou uso com capacete, o suporte peitoral (chest-mount) também é muito estável.';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'model',
          text: fallback,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        sender: 'model',
        text: config.welcomeMessage,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto sm:my-8 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92dvh] sm:max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#00c860] via-[#00ff87] to-cyan-400 p-0.5 shadow-lg shadow-[#00e575]/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#00e575]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-bold text-white font-display truncate max-w-[140px] sm:max-w-none">
                  {config.assistantName || 'Assistente IA Gemini'}
                </h3>
                <span className="text-[9px] sm:text-[10px] font-mono bg-[#00e575]/15 text-[#00e575] border border-[#00e575]/30 px-1.5 py-0.2 rounded font-bold shrink-0">
                  {config.model}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
                Especialista em tarefas POV, aprovação de bônus e suporte
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                title="Configurar Assistente no Painel Admin"
                className="p-1.5 rounded-lg text-slate-300 hover:text-[#00e575] hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 text-xs"
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">Configurar</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleClear}
              title="Limpar conversa"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-3 bg-[#090d10] text-xs sm:text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[80%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-[#00e575] text-slate-950'
                    : 'bg-slate-800 text-[#00e575] border border-white/10'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>

              <div className="flex flex-col space-y-1">
                <div
                  className={`p-3 sm:p-3.5 rounded-2xl leading-relaxed text-xs sm:text-sm ${
                    m.sender === 'user'
                      ? 'bg-[#00e575] text-slate-950 font-medium rounded-tr-none shadow-md shadow-[#00e575]/15'
                      : 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] text-slate-500 font-mono ${
                    m.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 sm:gap-2.5 mr-auto max-w-[85%]">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg shrink-0 bg-slate-800 text-[#00e575] border border-white/10 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 rounded-tl-none flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#00e575] animate-ping" />
                <span>O Gemini está pensando...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 sm:px-4 py-2 bg-slate-950 border-t border-white/5 flex gap-1.5 overflow-x-auto text-[10px] sm:text-[11px] no-scrollbar shrink-0">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(qp)}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00e575]/15 hover:text-[#00e575] border border-white/5 text-slate-300 transition-colors cursor-pointer shrink-0 active:scale-95"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-2.5 sm:p-4 bg-slate-950 border-t border-white/10 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre tarefas, bônus e equipamentos..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#00e575] hover:bg-[#00ff87] disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#00e575]/25 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
