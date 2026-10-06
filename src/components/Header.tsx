import React, { useState } from 'react';
import { Video, PlusCircle, Wallet, Sparkles, Sliders, Menu, X, ArrowRight, User } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavClick = (callback?: () => void) => {
    setIsMobileMenuOpen(false);
    if (callback) callback();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0f12]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
        {/* Zone 1: Wordmark Brand */}
        <a href="#" className="flex items-center gap-2 text-white group focus:outline-none shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#00c860] to-[#00ff87] flex items-center justify-center shadow-lg shadow-[#00e575]/20 group-hover:scale-105 transition-transform shrink-0">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-950 fill-current" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-extrabold tracking-tight text-white font-display whitespace-nowrap">
              Freela<span className="text-[#00e575]">Hub</span>
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-medium text-slate-300">
          <a href="#vagas" className="hover:text-[#00e575] transition-colors whitespace-nowrap">
            Vagas Diárias
          </a>
          <button 
            type="button" 
            onClick={onOpenHowItWorks} 
            className="hover:text-[#00e575] transition-colors cursor-pointer whitespace-nowrap"
          >
            Como Funciona
          </button>
          <a href="#bonus-video" className="hover:text-[#00e575] transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <span>Bônus em Vídeo</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#00e575] bg-[#00e575]/10 px-1.5 py-0.5 rounded">
              Ativo
            </span>
          </a>
          <button
            type="button"
            onClick={onOpenGemini}
            className="flex items-center gap-1.5 text-slate-200 hover:text-[#00e575] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00e575]" />
            <span>Assistente Gemini</span>
          </button>
          <a href="#calculadora" className="hover:text-[#00e575] transition-colors whitespace-nowrap">
            Calculadora
          </a>
          <a href="#starter-kit" className="hover:text-[#00e575] transition-colors whitespace-nowrap">
            Starter Kit
          </a>
          <a href="#faq" className="hover:text-[#00e575] transition-colors whitespace-nowrap">
            FAQ
          </a>
        </nav>

        {/* Zone 3: Actions (Desktop & Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Admin Panel Button (Tablet / Desktop) */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
            title="Painel de Controle Administrativo & Configurações da IA"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Admin</span>
          </button>

          {/* Gemini AI Trigger Button (All screens, responsive compact on small mobile) */}
          <button
            type="button"
            onClick={onOpenGemini}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-white bg-slate-800/90 hover:bg-slate-700/90 border border-[#00e575]/30 hover:border-[#00e575] rounded-lg transition-all cursor-pointer shadow-sm shadow-[#00e575]/10 shrink-0"
            title="Abrir Assistente Gemini IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00e575] animate-pulse" />
            <span className="hidden sm:inline">Gemini IA</span>
          </button>

          {/* Post Task Button for Companies (Desktop) */}
          <button
            type="button"
            onClick={onOpenCreateTask}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#00e575]" />
            <span>Publicar Vaga</span>
          </button>

          {/* Wallet Button */}
          <button
            type="button"
            onClick={onOpenWallet}
            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-100 bg-slate-800/80 hover:bg-slate-800 border border-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Minha Carteira PIX"
          >
            <Wallet className="w-3.5 h-3.5 text-[#00e575] shrink-0" />
            <span className="font-mono font-bold text-[#00e575] text-[11px] sm:text-xs whitespace-nowrap">
              R$ {walletBalance.toFixed(0)}
            </span>
          </button>

          {/* Login / User button (Desktop) */}
          {currentUser ? (
            <span className="text-xs font-semibold text-slate-300 hidden md:inline bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg truncate max-w-[110px]">
              {currentUser.name.split(' ')[0]}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-2 py-1.5 cursor-pointer hidden md:inline whitespace-nowrap"
            >
              Entrar
            </button>
          )}

          {/* Primary CTA (Tablet & Desktop) */}
          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="hidden sm:inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-lg transition-all shadow-md shadow-[#00e575]/25 hover:shadow-lg hover:shadow-[#00e575]/35 cursor-pointer whitespace-nowrap"
          >
            Cadastre-se
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center"
            aria-label="Abrir menu de navegação"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0b0f12]/98 backdrop-blur-xl px-4 py-5 space-y-4 max-h-[calc(100dvh-4rem)] overflow-y-auto animate-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col space-y-1.5 text-sm font-medium text-slate-200">
            <a
              href="#vagas"
              onClick={() => handleMobileNavClick()}
              className="p-3 rounded-xl hover:bg-white/5 flex items-center justify-between active:bg-white/10"
            >
              <span>Vagas Diárias</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </a>

            <button
              type="button"
              onClick={() => handleMobileNavClick(onOpenHowItWorks)}
              className="p-3 rounded-xl hover:bg-white/5 flex items-center justify-between text-left cursor-pointer active:bg-white/10"
            >
              <span>Como Funciona</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>

            <a
              href="#bonus-video"
              onClick={() => handleMobileNavClick()}
              className="p-3 rounded-xl hover:bg-white/5 flex items-center justify-between active:bg-white/10"
            >
              <div className="flex items-center gap-2">
                <span>Bônus em Vídeo</span>
                <span className="text-[10px] font-bold uppercase text-[#00e575] bg-[#00e575]/15 px-1.5 py-0.5 rounded">
                  Ativo
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </a>

            <a
              href="#calculadora"
              onClick={() => handleMobileNavClick()}
              className="p-3 rounded-xl hover:bg-white/5 flex items-center justify-between active:bg-white/10"
            >
              <span>Calculadora de Ganhos</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </a>

            <a
              href="#starter-kit"
              onClick={() => handleMobileNavClick()}
              className="p-3 rounded-xl hover:bg-white/5 flex items-center justify-between active:bg-white/10"
            >
              <span>Starter Kit & Suportes POV</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </a>

            <a
              href="#faq"
              onClick={() => handleMobileNavClick()}
              className="p-3 rounded-xl hover:bg-white/5 flex items-center justify-between active:bg-white/10"
            >
              <span>Perguntas Frequentes (FAQ)</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </a>
          </nav>

          {/* Mobile Quick Action Buttons Grid */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleMobileNavClick(onOpenGemini)}
              className="p-3 rounded-xl bg-slate-800 border border-[#00e575]/30 flex items-center justify-center gap-2 text-white active:scale-98 transition-transform cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#00e575]" />
              <span>Gemini IA</span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileNavClick(onOpenAdmin)}
              className="p-3 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center gap-2 text-slate-200 active:scale-98 transition-transform cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Painel Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileNavClick(onOpenCreateTask)}
              className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-slate-300 active:scale-98 transition-transform cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#00e575]" />
              <span>Publicar Vaga</span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileNavClick(() => onOpenAuth('login'))}
              className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-slate-300 active:scale-98 transition-transform cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Entrar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleMobileNavClick(() => onOpenAuth('register'))}
            className="w-full py-3.5 text-center text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl shadow-lg shadow-[#00e575]/25 active:scale-98 transition-transform cursor-pointer"
          >
            Cadastre-se para Gravar & Ganhar
          </button>
        </div>
      )}
    </header>
  );
};

