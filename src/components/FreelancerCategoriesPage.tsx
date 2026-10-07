/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Bell,
  User,
  Plus,
  Home,
  Briefcase,
  MessageSquare,
  ChevronRight,
  Phone,
  PhoneCall,
  Sparkles,
  Check,
  Flame,
  Wrench,
  Car,
  Laptop,
  Utensils,
  Hammer,
  Clock,
  Video,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Smartphone,
  Maximize2,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { Task, WorkLocationType } from '../types';

interface FreelancerCategoriesPageProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: () => void;
  onOpenDailyMissions: () => void;
  onOpenVideoPage: () => void;
  onOpenWallet: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAdmin: () => void;
  currentUser: { name: string; email: string; role: 'freelancer' | 'empresa' } | null;
  walletBalance: number;
}

export const FreelancerCategoriesPage: React.FC<FreelancerCategoriesPageProps> = ({
  tasks,
  onSelectTask,
  onOpenCreateTask,
  onOpenDailyMissions,
  onOpenVideoPage,
  onOpenWallet,
  onOpenAuth,
  onOpenAdmin,
  currentUser,
  walletBalance,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'valid' | 'progress' | 'featured' | '24h' | 'home' | 'workplace'>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isPhoneMockupMode, setIsPhoneMockupMode] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'projetos' | 'mensagens' | 'perfil'>('home');

  // Filter tasks based on query and filter pills
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchCat = task.category.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        const matchComp = task.company.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchDesc && !matchComp) return false;
      }

      // Filter pills
      if (activeFilterTab === '24h' && !task.isDailyMission) return false;
      if (activeFilterTab === 'home' && task.locationType !== 'home') return false;
      if (activeFilterTab === 'workplace' && task.locationType !== 'workplace') return false;
      if (activeFilterTab === 'featured' && (!task.hasActiveBonus || task.videoBonus <= 0)) return false;

      return true;
    });
  }, [tasks, searchQuery, activeFilterTab]);

  // Group tasks by category
  const categoriesMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    filteredTasks.forEach((t) => {
      const cat = t.category || 'Serviços Gerais';
      if (!map[cat]) map[cat] = [];
      map[cat].push(t);
    });
    return map;
  }, [filteredTasks]);

  // Currently active selected task
  const activeSelectedTask = useMemo(() => {
    return tasks.find((t) => t.id === selectedTaskId) || filteredTasks[0] || tasks[0];
  }, [tasks, selectedTaskId, filteredTasks]);

  const handleCopyPhone = (e: React.MouseEvent, phone: string, taskId: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(taskId);
    setTimeout(() => setCopiedPhoneId(null), 2500);
  };

  const handleAcceptTask = () => {
    if (activeSelectedTask) {
      onSelectTask(activeSelectedTask);
    }
  };

  const categoryIcon = (categoryName: string) => {
    const cat = categoryName.toLowerCase();
    if (cat.includes('manuten') || cat.includes('casa')) {
      return (
        <div className="w-13 h-13 rounded-xl bg-emerald-50 flex items-center justify-center text-[#00a859] shrink-0 border border-emerald-200/80 shadow-2xs">
          <Wrench className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    if (cat.includes('auto') || cat.includes('mecân')) {
      return (
        <div className="w-13 h-13 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200/80 shadow-2xs">
          <Car className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    if (cat.includes('tecno') || cat.includes('digital') || cat.includes('ti')) {
      return (
        <div className="w-13 h-13 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0 border border-purple-200/80 shadow-2xs">
          <Laptop className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    if (cat.includes('culin') || cat.includes('cozinha') || cat.includes('pão')) {
      return (
        <div className="w-13 h-13 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200/80 shadow-2xs">
          <Utensils className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    return (
      <div className="w-13 h-13 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 border border-slate-200 shadow-2xs">
        <Hammer className="w-6 h-6 stroke-[2]" />
      </div>
    );
  };

  const renderContent = () => (
    <div className="w-full flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 pb-28">
      {/* Top Header: Brand, Navigation to Video, Search and Profile */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-4 py-3 shadow-xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {/* Logo Freelahub with clean modern typography */}
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-black tracking-tight text-slate-900 flex items-center font-sans">
              Freela<span className="text-[#00a859]">hub</span>
              <span className="w-2 h-2 rounded-full bg-[#00a859] ml-1 self-baseline mt-2 animate-pulse" />
            </h1>
          </div>

          {/* Action Icons right side */}
          <div className="flex items-center gap-2">
            {/* Quick Switch to Video Page */}
            <button
              type="button"
              onClick={onOpenVideoPage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-200/60"
              title="Acessar a página de gravação de vídeo & bônus POV"
            >
              <Video className="w-3.5 h-3.5 text-[#00a859]" />
              <span className="hidden sm:inline">Página de Vídeo</span>
              <span className="sm:hidden">Vídeo</span>
            </button>

            {/* Notifications with badge '3' */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors relative cursor-pointer border border-transparent hover:border-slate-200"
                title="Notificações e Missões de 24h"
              >
                <Bell className="w-4.5 h-4.5 text-slate-700" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  3
                </span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-left animate-in fade-in-50 slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-900">Notificações</span>
                    <span className="text-xs text-[#00a859] font-bold">3 novas</span>
                  </div>
                  <div className="space-y-2.5 pt-2.5 text-xs">
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        onOpenDailyMissions();
                      }}
                      className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 cursor-pointer transition-colors"
                    >
                      <p className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                        <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        Missão Diária expira em 5h!
                      </p>
                      <p className="text-slate-600 text-[11.5px] mt-1 leading-snug">
                        Veja o número do contratante na vaga de Manutenção Residencial.
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        onOpenWallet();
                      }}
                      className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 cursor-pointer transition-colors"
                    >
                      <p className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Novo Bônus disponível!
                      </p>
                      <p className="text-slate-600 text-[11.5px] mt-1 leading-snug">
                        Bônus em vídeo de +R$ 30 aprovado via PIX.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <button
              type="button"
              onClick={() => (currentUser ? onOpenWallet() : onOpenAuth('login'))}
              className="w-9 h-9 rounded-full ring-2 ring-[#00a859]/30 overflow-hidden cursor-pointer bg-slate-200 flex items-center justify-center shrink-0 hover:ring-[#00a859] transition-all"
              title={currentUser ? `Conectado como ${currentUser.name}` : 'Entrar / Cadastrar'}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Perfil do Usuário"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full px-4 pt-3.5 flex-1 flex flex-col space-y-4">
        {/* Search Bar - Clear typography & high contrast */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por serviços, ocupações..."
            className="w-full bg-slate-100/80 hover:bg-slate-200/60 focus:bg-white text-slate-900 placeholder:text-slate-500 pl-11 pr-10 py-3 rounded-full text-sm border border-slate-200/80 focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 outline-none transition-all shadow-2xs font-normal"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills Carousel matching screenshot */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-4 px-4">
          <button
            type="button"
            onClick={() => setActiveFilterTab('progress')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer ${
              activeFilterTab === 'progress'
                ? 'bg-emerald-50 text-[#008744] border-[#00a859] shadow-2xs font-bold ring-2 ring-[#00a859]/15'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>📋</span>
            <span>Em andamento (0)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilterTab('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer ${
              activeFilterTab === 'all'
                ? 'bg-emerald-50 text-[#008744] border-[#00a859] shadow-2xs font-bold ring-2 ring-[#00a859]/15'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>✅</span>
            <span>Válidos ({tasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilterTab('featured')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer ${
              activeFilterTab === 'featured'
                ? 'bg-emerald-50 text-[#008744] border-[#00a859] shadow-2xs font-bold ring-2 ring-[#00a859]/15'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>⭐</span>
            <span>Nota de destaque</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilterTab('24h')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer ${
              activeFilterTab === '24h'
                ? 'bg-amber-50 text-amber-800 border-amber-400 font-bold ring-2 ring-amber-400/20 shadow-2xs'
                : 'bg-white text-amber-800 border-amber-200/90 hover:bg-amber-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>24 Horas & Contatos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilterTab('home')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer ${
              activeFilterTab === 'home'
                ? 'bg-emerald-50 text-[#008744] border-[#00a859] font-bold ring-2 ring-[#00a859]/15'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>🛋️</span>
            <span>Em casa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilterTab('workplace')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer ${
              activeFilterTab === 'workplace'
                ? 'bg-emerald-50 text-[#008744] border-[#00a859] font-bold ring-2 ring-[#00a859]/15'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>👷</span>
            <span>No trabalho</span>
          </button>
        </div>

        {/* Quick action banner for 24h Missions & Direct Contractor Contact */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00a859] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#00a859]/25">
              <Flame className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Vagas com Expiração em 24h
              </p>
              <p className="text-[11.5px] text-slate-600 mt-0.5">
                Veja o telefone e WhatsApp direto do contratante
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenDailyMissions}
            className="px-3.5 py-2 bg-[#00a859] hover:bg-[#00964f] text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-[#00a859]/20 cursor-pointer shrink-0"
          >
            Ver Vagas 24h
          </button>
        </div>

        {/* List of Task Categories matching the screenshot layout */}
        <div className="space-y-6 pt-1">
          {Object.keys(categoriesMap).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Nenhum serviço encontrado</h3>
              <p className="text-xs text-slate-500">Tente buscar por outro termo ou redefinir os filtros.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilterTab('all');
                }}
                className="px-4 py-2 bg-[#00a859] text-white text-xs font-bold rounded-xl"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            Object.entries(categoriesMap).map(([categoryName, categoryTasks]) => (
              <section key={categoryName} className="space-y-3">
                {/* Section Header with Chevron '>' like screenshot */}
                <div
                  onClick={() => setSearchQuery(categoryName)}
                  className="flex items-center justify-between text-slate-900 cursor-pointer group select-none py-0.5"
                >
                  <h2 className="text-[15px] sm:text-base font-bold tracking-tight text-slate-900 group-hover:text-[#00a859] transition-colors flex items-center gap-1.5">
                    <span>{categoryName}</span>
                  </h2>
                  <div className="flex items-center text-slate-400 group-hover:text-[#00a859] transition-colors">
                    <span className="text-xs font-medium mr-1 text-slate-500">{categoryTasks.length}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="space-y-3">
                  {categoryTasks.map((task) => {
                    const isSelected = activeSelectedTask?.id === task.id;
                    const estimatedMonth = (task.basePay * 40).toLocaleString('pt-BR');

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-2 border-[#00a859] shadow-md shadow-[#00a859]/10 bg-emerald-50/10'
                            : 'border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Icon or Thumbnail */}
                            {task.image ? (
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                <img
                                  src={task.image}
                                  alt={task.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              categoryIcon(task.category)
                            )}

                            {/* Center Title, Company & Description */}
                            <div className="flex-1 min-w-0 pr-1">
                              <h3 className="text-[14.5px] font-semibold text-slate-900 leading-snug line-clamp-1">
                                {task.title}
                              </h3>
                              <p className="text-[12.5px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                                {task.description}
                              </p>

                              {/* Tags row matching screenshot */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                {task.contractorPhone && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyPhone(e, task.contractorPhone!, task.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#008744] border border-emerald-200/80 text-[11px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                                    title="Clique para copiar telefone do contratante"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>
                                      {copiedPhoneId === task.id ? 'Copiado!' : task.contractorPhone}
                                    </span>
                                  </button>
                                )}

                                {task.isDailyMission && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10.5px] font-semibold">
                                    <Flame className="w-2.5 h-2.5 text-amber-500" />
                                    Expira em {task.expiresInHours || 24}h
                                  </span>
                                )}

                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-medium">
                                  {task.locationType === 'home' ? '🛋️ Em casa' : '👷 No local'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Pricing Box with clear readable typography */}
                          <div className="text-right shrink-0 flex flex-col items-end pl-1">
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                              Renda esperada
                            </span>
                            <span className="text-xl sm:text-[22px] font-bold text-[#00a859] tracking-tight leading-tight mt-0.5">
                              R$ {task.basePay}/h
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                              R$ {estimatedMonth}/mês
                            </span>
                          </div>
                        </div>

                        {/* Direct action triggers */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11.5px] text-slate-500 font-medium">
                            {task.slotsTotal - task.slotsFilled} vagas restantes
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTask(task);
                            }}
                            className="text-[#00a859] hover:text-[#008744] font-semibold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <span>Ver Detalhes</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Floating/Bottom Action Button "Aceitar" matching screenshot */}
        <div className="pt-3 sticky bottom-20 z-30">
          <button
            type="button"
            onClick={handleAcceptTask}
            className="w-full py-3.5 sm:py-4 bg-[#00a859] hover:bg-[#00964f] active:scale-[0.99] text-white text-base font-bold rounded-2xl shadow-lg shadow-[#00a859]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Aceitar</span>
            {activeSelectedTask && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold ml-1 max-w-[200px] truncate">
                {activeSelectedTask.title}
              </span>
            )}
          </button>
        </div>
      </main>

      {/* Bottom Navigation Bar with 5 icons matching screenshot */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 py-2 px-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-around relative">
          {/* 1. Home (Active) */}
          <button
            type="button"
            onClick={() => setActiveBottomTab('home')}
            className={`flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeBottomTab === 'home' ? 'text-[#00a859]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px]">Home</span>
          </button>

          {/* 2. Projetos / Vagas */}
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab('projetos');
              onOpenWallet();
            }}
            className={`flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeBottomTab === 'projetos' ? 'text-[#00a859]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Briefcase className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px]">Projetos</span>
          </button>

          {/* 3. Central Prominent Plus Button (+) */}
          <button
            type="button"
            onClick={onOpenCreateTask}
            className="w-12 h-12 rounded-full bg-[#00a859] hover:bg-[#00964f] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-[#00a859]/35 -mt-6 ring-4 ring-white transition-all cursor-pointer"
            title="Postar Nova Vaga de Freelancer"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          {/* 4. Mensagens / Missões com Badge */}
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab('mensagens');
              onOpenDailyMissions();
            }}
            className={`flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors relative cursor-pointer ${
              activeBottomTab === 'mensagens' ? 'text-[#00a859]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
            </div>
            <span className="text-[10px]">Mensagens</span>
          </button>

          {/* 5. Perfil */}
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab('perfil');
              currentUser ? onOpenWallet() : onOpenAuth('login');
            }}
            className={`flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeBottomTab === 'perfil' ? 'text-[#00a859]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px]">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-start">
      {/* Subtle top notification/view bar on wider viewports */}
      <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-300 z-50">
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00a859] animate-pulse" />
            <span className="font-semibold text-white">Hub de Categorias FreelaHub</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">Tipografia & Layout Otimizados</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenVideoPage}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors cursor-pointer font-medium"
            >
              <Video className="w-3.5 h-3.5 text-[#00a859]" />
              <span>Ver Página de Vídeo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPhoneMockupMode(!isPhoneMockupMode)}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-md transition-colors cursor-pointer font-medium"
            >
              {isPhoneMockupMode ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Tela Cheia</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Moldura Smartphone</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container - either in phone mockup or full width */}
      {isPhoneMockupMode ? (
        <div className="my-8 relative w-[420px] max-w-full rounded-[44px] p-3.5 bg-slate-900 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-700">
          {/* Dynamic Island */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end pr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
          </div>
          <div className="rounded-[34px] overflow-hidden border border-slate-800 max-h-[860px] overflow-y-auto no-scrollbar bg-[#f8fafc]">
            {renderContent()}
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 flex justify-center">
          {renderContent()}
        </div>
      )}
    </div>
  );
};
