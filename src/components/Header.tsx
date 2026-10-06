import React from 'react';
import { Video, PlusCircle, Wallet, Sparkles, Sliders } from 'lucide-react';

interface HeaderProps {
  onOpenCreateTask: () => void;
  onOpenWallet: () => void;
  onOpenHowItWorks: () => void;
  onOpenAuth: (mode: 'register' | 'login') => void;
  onOpenGemini: () => void;
  onOpenAdmin: () => void;
  walletBalance: number;
  currentUser?: { name: string; email: string; role: 'freelancer' | 'empresa' } | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateTask,
  onOpenWallet,
  onOpenHowItWorks,
  onOpenAuth,
  onOpenGemini,
  onOpenAdmin,
  walletBalance,
  currentUser,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0f12]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Wordmark Brand */}
        <a href="#" className="flex items-center gap-2.5 text-white group focus:outline-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00c860] to-[#00ff87] flex items-center justify-center shadow-lg shadow-[#00e575]/20 group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-950 fill-current" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white font-display">
              Freela<span className="text-[#00e575]">Hub</span>
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a href="#vagas" className="hover:text-[#00e575] transition-colors">
            Vagas Diárias
          </a>
          <button 
            type="button" 
            onClick={onOpenHowItWorks} 
            className="hover:text-[#00e575] transition-colors cursor-pointer"
          >
            Como Funciona
          </button>
          <a href="#bonus-video" className="hover:text-[#00e575] transition-colors flex items-center gap-1.5">
            <span>Bônus em Vídeo</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#00e575] bg-[#00e575]/10 px-1.5 py-0.5 rounded">
              Ativo
            </span>
          </a>
          <button
            type="button"
            onClick={onOpenGemini}
            className="flex items-center gap-1.5 text-slate-200 hover:text-[#00e575] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00e575]" />
            <span>Assistente Gemini</span>
          </button>
          <a href="#calculadora" className="hover:text-[#00e575] transition-colors">
            Calculadora
          </a>
          <a href="#starter-kit" className="hover:text-[#00e575] transition-colors">
            Starter Kit
          </a>
          <a href="#faq" className="hover:text-[#00e575] transition-colors">
            FAQ
          </a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Admin Panel Button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
            title="Painel de Controle Administrativo & Configurações da IA"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Admin</span>
          </button>

          {/* Gemini AI Trigger Button */}
          <button
            type="button"
            onClick={onOpenGemini}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-800/90 hover:bg-slate-700/90 border border-[#00e575]/30 hover:border-[#00e575] rounded-lg transition-all cursor-pointer shadow-sm shadow-[#00e575]/10"
            title="Abrir Assistente Gemini IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00e575] animate-pulse" />
            <span className="hidden md:inline">Gemini IA</span>
          </button>

          {/* Post Task Button for Companies */}
          <button
            type="button"
            onClick={onOpenCreateTask}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#00e575]" />
            <span>Publicar Vaga</span>
          </button>

          {/* Wallet Button */}
          <button
            type="button"
            onClick={onOpenWallet}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-100 bg-slate-800/80 hover:bg-slate-800 border border-white/10 rounded-lg transition-colors cursor-pointer"
            title="Minha Carteira PIX"
          >
            <Wallet className="w-3.5 h-3.5 text-[#00e575]" />
            <span className="hidden xs:inline">Carteira:</span>
            <span className="font-mono font-bold text-[#00e575]">
              R$ {walletBalance.toFixed(2)}
            </span>
          </button>

          {/* Login / User button */}
          {currentUser ? (
            <span className="text-xs font-semibold text-slate-300 hidden md:inline bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg">
              Olá, {currentUser.name.split(' ')[0]}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-2 py-1.5 cursor-pointer hidden sm:inline"
            >
              Entrar
            </button>
          )}

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-lg transition-all shadow-md shadow-[#00e575]/25 hover:shadow-lg hover:shadow-[#00e575]/35 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
          >
            Cadastre-se
          </button>
        </div>
      </div>
    </header>
  );
};
