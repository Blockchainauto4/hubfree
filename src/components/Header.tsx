import React, { useState } from 'react';
import { Video, PlusCircle, Wallet, Sparkles, Sliders, Menu, X, ArrowRight, User, Flame } from 'lucide-react';

interface HeaderProps {
  onOpenCreateTask: () => void;
  onOpenWallet: () => void;
  onOpenHowItWorks: () => void;
  onOpenAuth: (mode: 'register' | 'login') => void;
  onOpenGemini?: () => void;
  onOpenAdmin: () => void;
  onOpenDailyMissions: () => void;
  onNavigateToCategories?: () => void;
  walletBalance: number;
  dailyMissionsCount?: number;
  currentUser?: { name: string; email: string; role: 'freelancer' | 'empresa' } | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateTask,
  onOpenWallet,
  onOpenHowItWorks,
  onOpenAuth,
  onOpenAdmin,
  onOpenDailyMissions,
  onNavigateToCategories,
  walletBalance,
  dailyMissionsCount = 6,
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
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 text-xs xl:text-sm font-medium text-slate-300">
          {onNavigateToCategories && (
            <button
              type="button"
              onClick={onNavigateToCategories}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-lg transition-all cursor-pointer shadow-sm shadow-[#00e575]/25 whitespace-nowrap"
              title="Voltar para a Página Principal de Categorias de Freelancer"
            >
              <span>📱 Categorias (Início)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenDailyMissions}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all cursor-pointer shadow-sm shadow-amber-500/10 whitespace-nowrap"
            title="Ver Missões Diárias de 24h com Contato Direto do Contratante"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>⚡ Missões 24h</span>
            <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded-full ml-0.5">
              {dailyMissionsCount}
            </span>
          </button>

          <a href="#vagas" className="hover:text-[#00e575] transition-colors whitespace-nowrap">
            Hub de Vagas
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
          <a
            href="https://wa.me/5511991271914?text=Ol%C3%A1!%20Vim%20pelo%20FreelaHub%20e%20gostaria%20de%20suporte."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-200 hover:text-[#25D366] transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Suporte WhatsApp</span>
          </a>
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
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 text-xs font-semibold text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-colors cursor-pointer"
            title="Painel Administrativo da Equipe FreelaHub: Postagem e Gestão de Vagas em Tempo Real"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Admin (Postar Vagas)</span>
            <span className="xl:hidden">Admin</span>
          </button>

          {/* Suporte WhatsApp Oficial (+55 11 99127-1914) */}
          <a
            href="https://wa.me/5511991271914?text=Ol%C3%A1!%20Vim%20pelo%20FreelaHub%20e%20gostaria%20de%20suporte."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-white bg-[#128C7E]/80 hover:bg-[#128C7E] border border-[#25D366]/40 hover:border-[#25D366] rounded-lg transition-all cursor-pointer shadow-sm shadow-[#25D366]/20 shrink-0"
            title="Abrir Suporte WhatsApp Oficial (+55 11 99127-1914)"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-[#25D366]" aria-hidden="true">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.67-1.39 1.27-1.92 1.35-.5.08-1.14.12-3.69-.93-3.26-1.34-5.35-4.66-5.51-4.88-.16-.22-1.32-1.75-1.32-3.34 0-1.59.83-2.37 1.13-2.69.29-.32.65-.4.87-.4.21 0 .43.01.62.02.2.01.47-.08.73.55.27.65.92 2.24 1 2.4.08.16.13.35.03.56-.11.22-.16.35-.32.54-.16.19-.34.42-.48.56-.16.16-.33.33-.14.65.19.32.84 1.38 1.8 2.24 1.24 1.1 2.28 1.45 2.61 1.61.32.16.51.13.7-.08.19-.22.81-.95 1.03-1.27.22-.32.43-.27.73-.16.29.11 1.87.88 2.19 1.04.32.16.54.24.62.38.08.14.08.81-.16 1.48z" />
            </svg>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

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
            {onNavigateToCategories && (
              <button
                type="button"
                onClick={() => handleMobileNavClick(onNavigateToCategories)}
                className="p-3.5 rounded-xl bg-[#00e575] text-slate-950 font-bold flex items-center justify-between text-left cursor-pointer active:bg-[#00c860]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📱</span>
                  <span>Categorias de Freelancer (Início)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            )}

            {/* Daily Missions 24h Highlight in Mobile */}
            <button
              type="button"
              onClick={() => handleMobileNavClick(onOpenDailyMissions)}
              className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-500/5 border border-amber-500/30 flex items-center justify-between text-left cursor-pointer active:bg-amber-500/25"
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                <div>
                  <span className="font-bold text-amber-300 block">⚡ Missões Diárias (24h)</span>
                  <span className="text-[11px] text-slate-400">Ver contatos dos contratantes</span>
                </div>
              </div>
              <span className="text-xs bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full shrink-0">
                {dailyMissionsCount}
              </span>
            </button>

            <a
              href="#vagas"
              onClick={() => handleMobileNavClick()}
              className="p-3 rounded-xl hover:bg-white/5 flex items-center justify-between active:bg-white/10"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Hub de Vagas Freelancer</span>
                <span className="text-[10px] font-bold text-[#00e575] bg-[#00e575]/10 px-1.5 py-0.5 rounded">Início</span>
              </div>
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
            <a
              href="https://wa.me/5511991271914?text=Ol%C3%A1!%20Vim%20pelo%20FreelaHub%20e%20gostaria%20de%20suporte."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-[#128C7E]/70 border border-[#25D366]/40 flex items-center justify-center gap-2 text-white active:scale-98 transition-transform cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#25D366]" aria-hidden="true">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.67-1.39 1.27-1.92 1.35-.5.08-1.14.12-3.69-.93-3.26-1.34-5.35-4.66-5.51-4.88-.16-.22-1.32-1.75-1.32-3.34 0-1.59.83-2.37 1.13-2.69.29-.32.65-.4.87-.4.21 0 .43.01.62.02.2.01.47-.08.73.55.27.65.92 2.24 1 2.4.08.16.13.35.03.56-.11.22-.16.35-.32.54-.16.19-.34.42-.48.56-.16.16-.33.33-.14.65.19.32.84 1.38 1.8 2.24 1.24 1.1 2.28 1.45 2.61 1.61.32.16.51.13.7-.08.19-.22.81-.95 1.03-1.27.22-.32.43-.27.73-.16.29.11 1.87.88 2.19 1.04.32.16.54.24.62.38.08.14.08.81-.16 1.48z" />
              </svg>
              <span>Suporte WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => handleMobileNavClick(onOpenAdmin)}
              className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center gap-2 text-purple-300 active:scale-98 transition-transform cursor-pointer font-semibold"
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Admin (Postar Vagas)</span>
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

