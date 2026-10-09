/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  RotateCcw,
  Gift,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Phone,
  Sparkles,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OFFICIAL_TIKTOK_MISSION_URL } from '../data/defaultTikTokMissions';
import { unlockTikTokAccess } from '../services/tiktokService';
import { TikTokAccessState } from '../types';

interface TikTokMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessState: TikTokAccessState;
  onUnlocked: (state: TikTokAccessState) => void;
  customMissionUrl?: string;
  sourceContext?: string;
  permanenceSecondsLeft?: number;
}

export const TikTokMissionModal: React.FC<TikTokMissionModalProps> = ({
  isOpen,
  onClose,
  accessState,
  onUnlocked,
  customMissionUrl,
  permanenceSecondsLeft = 0,
}) => {
  const [isActivating, setIsActivating] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const targetUrl = customMissionUrl || OFFICIAL_TIKTOK_MISSION_URL;

  // Bloqueia qualquer rolagem e intercepta a tecla ESC enquanto o modal estiver aberto
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(Math.max(0, totalSec) / 60);
    const secs = Math.max(0, totalSec) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUnlockAll = async () => {
    setIsActivating(true);

    // Abre o link oficial da missão do TikTok
    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Fallback
    }

    // Desbloqueia o acesso por 24 horas no localStorage e banco de dados
    const newState = await unlockTikTokAccess('tiktok-mission-roda');
    setJustUnlocked(true);
    setIsActivating(false);

    // Efeito de confetes comemorativos
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00e575', '#fe2c55', '#25f4ee', '#ffffff'],
      });
    } catch {
      // ignora se canvas falhar
    }

    onUnlocked(newState);

    // Fecha o modal após confirmação do desbloqueio
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  const isAlreadyActive = accessState.isUnlocked && accessState.remainingMs > 0;

  return (
    // Bloqueia qualquer interação com o fundo (sem a opção de fechar)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto select-none pointer-events-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg my-auto bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header com gradiente TikTok */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-[#121820] to-[#0f172a] border-b border-white/10 shrink-0 text-center">
          {/* Efeitos de iluminação */}
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#fe2c55]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-[#25f4ee]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Badges superiores */}
          <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#fe2c55]/20 to-[#25f4ee]/20 border border-white/15 text-white text-xs font-bold uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5 text-[#fe2c55]" />
              Missão Oficial TikTok • FreelaHub
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00a859]/20 border border-[#00a859]/30 text-[#00e575] text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              Passe 24 Horas
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white font-display leading-tight">
            Gire a Roda no TikTok e Ganhe Recompensas!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed max-w-md mx-auto">
            Complete a missão da roda no TikTok para liberar o <strong className="text-[#00e575]">contato direto com todos os contratantes</strong> pelo período de <strong>24 horas</strong>.
          </p>
        </div>

        {/* Corpo com o campo da missão e o timer de 2 minutos */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Status se já foi liberado */}
          {justUnlocked || isAlreadyActive ? (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-[#00e575]/40 text-emerald-100 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#00e575] shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white block">Contatos Liberados por 24 Horas!</span>
                <span className="text-slate-300">Carregando os números dos contratantes na tela...</span>
              </div>
            </div>
          ) : null}

          {/* Campo da Missão com Timer de 2 minutos */}
          <div className="relative p-5 rounded-2xl bg-slate-950 border-2 border-[#fe2c55]/40 shadow-xl overflow-hidden text-center space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md bg-[#fe2c55] text-white text-[10.5px] font-black uppercase tracking-wider">
                Missão Principal
              </span>
              <span className="text-xs font-bold text-[#25f4ee] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Desbloqueio de 24h
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Gire a roda no TikTok e ganhe recompensas
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Acesse a roleta oficial para liberar todos os números de telefone e o botão de WhatsApp das vagas disponíveis.
              </p>
            </div>

            {/* Display do Timer de 2 Minutos */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col items-center justify-center space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Timer de Permanência (2 Minutos)</span>
              </div>

              {/* Tempo do Timer */}
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-lg">
                {permanenceSecondsLeft <= 0 ? '00:00' : formatTimer(permanenceSecondsLeft)}
              </div>

              {/* Barra de progresso dos 2 minutos */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1 max-w-xs">
                <div
                  className="bg-gradient-to-r from-[#fe2c55] via-amber-400 to-[#00e575] h-full transition-all duration-1000"
                  style={{
                    width: `${permanenceSecondsLeft <= 0 ? 0 : (permanenceSecondsLeft / 120) * 100}%`,
                  }}
                />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 pt-0.5">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>
                  {permanenceSecondsLeft <= 0
                    ? '2 minutos atingidos • Acesso bloqueado até a missão ser concluída'
                    : 'Navegação temporária • Libere o acesso completo de 24 horas abaixo'}
                </span>
              </div>
            </div>

            {/* Vagas que terão contato liberado */}
            <div className="pt-1 text-left bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Contatos desbloqueados por 24 horas:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] font-semibold text-slate-200">
                <div className="flex items-center gap-1 text-emerald-400">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span className="truncate">Barman (R$ 200)</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span className="truncate">Segurança (R$ 170)</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span className="truncate">Promotora (R$ 180)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ÚNICO BOTÃO DA MISSÃO: Liberar todos os números do contratante por 24 horas */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleUnlockAll}
              disabled={isActivating}
              className="w-full py-4 sm:py-4.5 px-4 rounded-2xl bg-gradient-to-r from-[#fe2c55] via-rose-600 to-[#25f4ee] hover:opacity-95 text-white font-black text-xs sm:text-sm md:text-[15px] shadow-2xl shadow-[#fe2c55]/35 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 uppercase tracking-wide text-center"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-[#25f4ee] animate-spin [animation-duration:8s] shrink-0" />
              <span>Liberar todos os números do contratante por 24 horas</span>
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-white" />
            </button>
          </div>

          {/* Nota de transparência */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00e575] shrink-0 mt-0.5" />
            <p>
              Ao clicar no botão, o link do TikTok será aberto e seu passe de 24 horas é ativado instantaneamente no FreelaHub para chamar os contratantes no WhatsApp e visualizar todos os telefones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
