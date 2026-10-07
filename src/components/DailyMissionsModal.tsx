/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Phone,
  PhoneCall,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Building2,
  User,
  Flame,
  ShieldCheck,
  Search,
  ExternalLink,
  Briefcase,
  PlayCircle
} from 'lucide-react';
import { Task } from '../types';

interface DailyMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
}) => {
  if (!isOpen) return null;

  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'critical' | 'high'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Tick every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter tasks that are daily missions or expiring within 24h
  const dailyMissions = tasks.filter((t) => {
    const isDaily = t.isDailyMission || (typeof t.expiresInHours === 'number' && t.expiresInHours <= 24);
    if (!isDaily) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCompany = t.company.toLowerCase().includes(q);
      const matchContact = t.contractorContactName?.toLowerCase().includes(q) || false;
      const matchPhone = t.contractorPhone?.includes(q) || false;
      if (!matchTitle && !matchCompany && !matchContact && !matchPhone) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

    // Urgency filter
    if (filterUrgency === 'critical') {
      const hours = t.expiresInHours ?? 24;
      if (hours > 6 && t.missionUrgency !== 'critica') return false;
    } else if (filterUrgency === 'high') {
      const hours = t.expiresInHours ?? 24;
      if (hours > 12) return false;
    }

    return true;
  });

  // Calculate stats
  const totalBonusPool = dailyMissions.reduce((acc, t) => acc + (t.videoBonus || 0), 0);
  const criticalCount = dailyMissions.filter(
    (t) => (t.expiresInHours && t.expiresInHours <= 6) || t.missionUrgency === 'critica'
  ).length;

  const handleCopyPhone = (taskId: string, phone: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(taskId);
    setTimeout(() => {
      setCopiedPhoneId(null);
    }, 2500);
  };

  // Format countdown string
  const formatCountdown = (task: Task) => {
    if (task.expiresAt) {
      const target = new Date(task.expiresAt).getTime();
      const remainingMs = target - currentTime;
      if (remainingMs <= 0) return 'Expirado';

      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
      return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }

    const fallbackHours = task.expiresInHours || 24;
    return `${fallbackHours}h restantes`;
  };

  const getCleanWhatsappNumber = (phone?: string, whatsapp?: string) => {
    if (whatsapp) return whatsapp.replace(/\D/g, '');
    if (phone) return phone.replace(/\D/g, '');
    return '5511987654321';
  };

  const getWhatsappUrl = (task: Task) => {
    const rawNumber = getCleanWhatsappNumber(task.contractorPhone, task.contractorWhatsapp);
    const contactName = task.contractorContactName || 'Contratante';
    const message = encodeURIComponent(
      `Olá ${contactName}! Vi sua vaga diária no FreelaHub ("${task.title}") com prazo de 24 horas. Tenho disponibilidade imediata para gravar e enviar o material em alta resolução!`
    );
    return `https://wa.me/${rawNumber}?text=${message}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto sm:my-8 bg-slate-900 border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[94dvh] sm:max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-white/10 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  EXPIRAÇÃO RÁPIDA: 24 HORAS
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#00e575]/15 text-[#00e575] border border-[#00e575]/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  NÚMERO DO CONTRATANTE LIBERADO
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight">
                Missões Diárias & Contato Direto com Contratantes
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Essas vagas possuem prazo limite de 24h e bônus relâmpago. Veja o telefone ou WhatsApp do responsável para tirar dúvidas ou fechar a execução na hora.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mt-4 pt-4 border-t border-white/10">
            <div className="bg-slate-950/60 border border-white/10 rounded-xl p-2.5 sm:p-3">
              <span className="text-[11px] text-slate-400 font-medium block">Vagas Expirando Hoje</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base sm:text-xl font-bold font-mono text-white">{dailyMissions.length}</span>
                <span className="text-[10px] text-amber-400 font-semibold">({criticalCount} urgentes)</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-white/10 rounded-xl p-2.5 sm:p-3">
              <span className="text-[11px] text-slate-400 font-medium block">Total em Bônus Relâmpago</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base sm:text-xl font-bold font-mono text-[#00e575]">
                  +R$ {totalBonusPool.toFixed(0)}
                </span>
                <span className="text-[10px] text-slate-400">em extras PIX</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950/60 border border-white/10 rounded-xl p-2.5 sm:p-3">
              <span className="text-[11px] text-slate-400 font-medium block">Canal de Contato</span>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-emerald-300">
                <PhoneCall className="w-3.5 h-3.5 text-[#00e575]" />
                <span>Telefone & WhatsApp Diretos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por vaga, empresa ou nome do contratante..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]"
            />
          </div>

          {/* Quick filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterUrgency('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterUrgency === 'all'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Todas (24h)
            </button>
            <button
              type="button"
              onClick={() => setFilterUrgency('critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterUrgency === 'critical'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Críticas (&lt; 6h)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterUrgency('high')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterUrgency === 'high'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Alta (&lt; 12h)
            </button>
          </div>
        </div>

        {/* Missions Cards List */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {dailyMissions.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3">
              <Clock className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-base font-bold text-white">Nenhuma missão encontrada</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Não há vagas expirando nesse filtro no momento. Altere seus filtros de busca ou verifique o feed geral.
              </p>
            </div>
          ) : (
            dailyMissions.map((task) => {
              const countdown = formatCountdown(task);
              const isCritical = (task.expiresInHours && task.expiresInHours <= 6) || task.missionUrgency === 'critica';
              const contractorPhone = task.contractorPhone || '+55 (11) 98765-4321';
              const contractorName = task.contractorContactName || 'Coordenador de Vagas';
              const contractorRole = task.contractorRole || 'Supervisor de Operações';

              return (
                <div
                  key={task.id}
                  className="bg-slate-950/70 border border-white/10 hover:border-[#00e575]/40 rounded-2xl p-4 sm:p-5 transition-all shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                >
                  {/* Left Column: Info & Countdown */}
                  <div className="space-y-3 flex-1 min-w-0">
                    {/* Urgency Badge & Countdown */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wide ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Expira em: {countdown}</span>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                        {task.category}
                      </span>

                      <span className="text-[11px] font-medium text-slate-400">
                        {task.locationType === 'workplace' ? '👷 No Trabalho' : '🛋️ Em Casa'}
                      </span>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {task.slotsTotal - task.slotsFilled} vagas restantes
                      </span>
                    </div>

                    {/* Title & Company */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#00e575] transition-colors leading-snug">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-medium text-slate-300">{task.company}</span>
                        <span>•</span>
                        <span>{task.durationMinutes} min de gravação</span>
                      </div>
                    </div>

                    {/* Financial Rewards */}
                    <div className="flex items-center gap-2.5 flex-wrap pt-1">
                      <div className="text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 font-mono">
                        Base: <strong className="text-white">R$ {task.basePay}</strong>
                      </div>

                      {task.hasActiveBonus && (
                        <div className="text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-mono flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#00e575]" />
                          <span>Bônus Vídeo: <strong>+R$ {task.videoBonus}</strong></span>
                        </div>
                      )}

                      <div className="text-xs font-bold text-[#00e575] font-mono">
                        Total: R$ {(task.basePay + (task.videoBonus || 0)).toFixed(0)}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Contractor Contact Box (Highlighted Requirement) */}
                  <div className="w-full lg:w-84 bg-slate-900 border border-white/10 rounded-xl p-3.5 sm:p-4 space-y-3 shrink-0">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#00e575]/15 border border-[#00e575]/30 flex items-center justify-center text-[#00e575]">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="leading-tight">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Contratante Oficial
                          </span>
                          <span className="text-xs font-bold text-white truncate max-w-[170px] block">
                            {contractorName}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Verificado
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {contractorRole}
                    </div>

                    {/* Contractor Phone Display */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-4 h-4 text-[#00e575] shrink-0" />
                        <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                          {contractorPhone}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyPhone(task.id, contractorPhone)}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                          copiedPhoneId === task.id
                            ? 'bg-[#00e575] text-slate-950 font-bold'
                            : 'bg-white/10 hover:bg-white/15 text-slate-300'
                        }`}
                        title="Copiar número de telefone"
                      >
                        {copiedPhoneId === task.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline">Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Contact Actions: WhatsApp & Call */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* WhatsApp Button */}
                      <a
                        href={getWhatsappUrl(task)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-xl text-xs font-bold bg-[#00e575] hover:bg-[#00ff87] text-slate-950 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#00e575]/20 hover:scale-[1.02]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Direct Phone Call Button */}
                      <a
                        href={`tel:${contractorPhone.replace(/\s+/g, '')}`}
                        className="py-2 px-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-[#00e575]" />
                        <span>Ligar</span>
                      </a>
                    </div>

                    {/* Action to view details or start submission */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectTask(task);
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-[#00e575]" />
                      <span>Ver Tarefa & Enviar Vídeo</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-[#00e575] shrink-0" />
            <span>
              Contratantes verificados com chave PIX ativa para liberação imediata do bônus diário.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
