import React from 'react';
import { Play, Sparkles, CheckCircle2, Video, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { WorkLocationType } from '../types';

interface HeroProps {
  locationFilter: WorkLocationType;
  onChangeLocation: (type: WorkLocationType) => void;
  onOpenHowItWorks: () => void;
  onExploreTasks: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  locationFilter,
  onChangeLocation,
  onOpenHowItWorks,
  onExploreTasks,
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 md:pt-14 md:pb-24 border-b border-white/5 bg-grid-pattern">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[200px] sm:h-[350px] bg-[#00e575]/10 rounded-full blur-[90px] sm:blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Headlines & Action Block */}
          <div className="lg:col-span-7 flex flex-col space-y-4 sm:space-y-6 text-left">
            {/* Tag Location Switcher as seen in screenshot */}
            <div className="inline-flex flex-wrap items-center gap-1 sm:gap-1.5 p-1 bg-slate-900/90 border border-white/10 rounded-2xl sm:rounded-full w-fit backdrop-blur-md max-w-full">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-950 bg-[#00e575] px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                NOVO
              </span>
              <button
                type="button"
                onClick={() => onChangeLocation(locationFilter === 'home' ? 'all' : 'home')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  locationFilter === 'home'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🛋️</span>
                <span>Em casa</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeLocation(locationFilter === 'workplace' ? 'all' : 'workplace')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  locationFilter === 'workplace'
                    ? 'bg-[#00e575] text-slate-950 shadow-md shadow-[#00e575]/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>👷</span>
                <span>No trabalho</span>
              </button>
            </div>

            {/* Main Headline */}
            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display leading-[1.08] break-words">
                Filmou <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#00e575]">
                  Ganhou
                </span>
              </h1>
              <p className="text-xs sm:text-base md:text-lg text-slate-300 max-w-xl font-normal leading-relaxed pt-0.5 sm:pt-2">
                Ganhe dinheiro gravando tarefas profissionais com o celular. Trabalho especializado de verdade: grave na sua empresa ou em casa, receba via PIX.
              </p>
            </div>

            {/* Rate & Bonus Callout */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 pt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#00e575] font-display">
                  R$ 50/h
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-medium">
                  por gravações aprovadas
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00e575]/10 border border-[#00e575]/25 text-[#00e575] text-[11px] sm:text-xs font-semibold w-fit">
                <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>Bônus Diário: até +R$ 35,00</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={onExploreTasks}
                className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all shadow-lg shadow-[#00e575]/25 hover:shadow-xl hover:shadow-[#00e575]/40 hover:-translate-y-0.5 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Cadastre-se & Gravar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="w-full sm:w-auto px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 rounded-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current text-white ml-0.5" />
                </div>
                <span>Como funciona</span>
              </button>
            </div>

            {/* Trust and Payment methods */}
            <div className="pt-3 sm:pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2.5 text-xs text-slate-400">
              <span className="font-medium text-slate-300">Receba via:</span>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 font-bold text-white bg-white/5 border border-white/10 px-2 sm:px-2.5 py-1 rounded text-[11px] sm:text-xs">
                  <svg className="w-3.5 h-3.5 text-[#00e575] fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.2l6 3.75v7.1L12 18.8 6 15.05v-7.1L12 4.2z" />
                  </svg>
                  PIX Imediato
                </span>
                <span className="font-semibold text-slate-300 bg-white/5 border border-white/10 px-2 sm:px-2.5 py-1 rounded text-[11px] sm:text-xs">
                  Bre-B
                </span>
                <span className="font-semibold text-slate-300 bg-white/5 border border-white/10 px-2 sm:px-2.5 py-1 rounded text-[11px] sm:text-xs">
                  IBAN
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400/90">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Auditoria & Aprovação em até 24h</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-white/15 bg-slate-900/80 shadow-2xl shadow-black/80 group">
              {/* Image Asset with fallback container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <img
                  src="/src/assets/images/hero_worker_headmount_camera_1791299023753.jpg"
                  alt="Profissional gravando tarefas com celular fixado na cabeça para FreelasHub"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top filter brightness-95 contrast-105 group-hover:scale-102 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Subtle scrim overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f12] via-transparent to-black/30 pointer-events-none" />

                {/* Live Camera Headmount Simulation Badge */}
                <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex items-center gap-1.5 sm:gap-2 bg-black/80 backdrop-blur-md border border-white/15 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-lg text-[9px] sm:text-xs font-mono text-white">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-semibold">REC POV</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-[#00e575]">1080p60</span>
                </div>

                {/* Bonus Badge Overlay */}
                <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 bg-[#00e575] text-slate-950 font-bold px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-lg text-[9px] sm:text-xs shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-current shrink-0" />
                  <span>+R$ 30 BÔNUS</span>
                </div>

                {/* Bottom Card Floating Telemetry */}
                <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-4 sm:inset-x-4 p-2.5 sm:p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/15 space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="text-slate-400">Tarefa Ativa Hoje:</span>
                    <span className="font-semibold text-white truncate max-w-[170px] sm:max-w-none">
                      Montagem de Painel Elétrico
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] sm:text-xs pt-1 border-t border-white/10">
                    <span className="text-[#00e575] font-semibold flex items-center gap-1 text-[10px] sm:text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Critérios do Bônus Atingidos
                    </span>
                    <span className="font-mono font-bold text-white text-xs sm:text-sm">
                      Total: R$ 85,00
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile inline trust strip */}
            <div className="mt-3 sm:hidden p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-2.5 text-xs">
              <div className="w-7 h-7 rounded-lg bg-[#00e575]/20 text-[#00e575] flex items-center justify-center font-bold text-xs shrink-0">
                ✓
              </div>
              <div className="text-[11px]">
                <p className="font-bold text-white">+1.400 gravações pagas</p>
                <p className="text-slate-400">Freelancers recebendo via PIX todo dia</p>
              </div>
            </div>

            {/* Desktop Floating Trust Pill */}
            <div className="absolute -bottom-4 -left-4 sm:left-4 bg-slate-900/90 border border-white/15 rounded-xl p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#00e575]/20 text-[#00e575] flex items-center justify-center font-bold shrink-0">
                ✓
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Mais de 1.400 gravações pagas</p>
                <p className="text-slate-400">Freelancers recebendo via PIX todo dia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
