import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Video, Clock, Users, Flame, ArrowUpRight, Check, Filter } from 'lucide-react';
import { Task, WorkLocationType } from '../types';

interface DailyTasksFeedProps {
  tasks: Task[];
  selectedLocation: WorkLocationType;
  onSelectLocation: (type: WorkLocationType) => void;
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: () => void;
}

export const DailyTasksFeed: React.FC<DailyTasksFeedProps> = ({
  tasks,
  selectedLocation,
  onSelectLocation,
  onSelectTask,
  onOpenCreateTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyWithBonus, setOnlyWithBonus] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(tasks.map((t) => t.category)));
    return ['all', ...cats];
  }, [tasks]);

  // Filter tasks based on search, location, category, and bonus
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Location filter
      if (selectedLocation !== 'all' && task.locationType !== selectedLocation) {
        return false;
      }

      // Bonus filter
      if (onlyWithBonus && (!task.hasActiveBonus || task.videoBonus <= 0)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesCompany = task.company.toLowerCase().includes(query);
        const matchesDesc = task.description.toLowerCase().includes(query);
        const matchesCategory = task.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, selectedLocation, onlyWithBonus, selectedCategory, searchQuery]);

  // Total active bonus sum
  const totalBonusPool = useMemo(() => {
    return tasks.reduce((sum, t) => sum + (t.hasActiveBonus ? t.videoBonus : 0), 0);
  }, [tasks]);

  return (
    <section id="vagas" className="py-10 sm:py-14 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-5 pb-5 sm:pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00e575] tracking-wider uppercase pb-1">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Atualizado Hoje</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display">
            Postagens Freelancer Diárias
          </h2>
          {/* Zero-Pill Metadata formatting per design skill */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-400 pt-1.5 sm:pt-2">
            <span>{tasks.length} tarefas abertas</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400 font-semibold font-mono">
              R$ {totalBonusPool},00 em bônus ativos
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Pagamento via PIX em até 24h</span>
          </div>
        </div>

        {/* Location Filter Segments (Mobile Optimized full-width) */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 bg-slate-900 border border-white/10 rounded-xl w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => onSelectLocation('all')}
            className={`px-2 sm:px-3 py-2 sm:py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedLocation === 'all'
                ? 'bg-white/15 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => onSelectLocation('workplace')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedLocation === 'workplace'
                ? 'bg-[#00e575] text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👷</span>
            <span>Trabalho</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectLocation('home')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedLocation === 'home'
                ? 'bg-[#00e575] text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🛋️</span>
            <span>Em Casa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-5 pb-5 sm:pt-6 sm:pb-6 items-center">
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tarefa (ex: elétrica, solda, culinária)..."
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575] transition-all"
          />
        </div>

        {/* Category Pills & Bonus Toggle */}
        <div className="md:col-span-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Category tabs with no-scrollbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-white/20 text-white font-bold'
                    : 'bg-slate-900/70 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat === 'all' ? 'Todas Áreas' : cat}
              </button>
            ))}
          </div>

          {/* Bonus Filter Toggle */}
          <button
            type="button"
            onClick={() => setOnlyWithBonus(!onlyWithBonus)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer shrink-0 ${
              onlyWithBonus
                ? 'bg-[#00e575]/20 text-[#00e575] border-[#00e575]'
                : 'bg-slate-900 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Com Bônus em Vídeo</span>
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 text-center border border-white/10 rounded-2xl bg-slate-900/40 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-display">Nenhuma postagem encontrada</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Não encontramos tarefas com os filtros selecionados. Tente limpar os termos de busca ou mudar a categoria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyWithBonus(false);
              onSelectLocation('all');
            }}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#00e575] rounded-lg hover:bg-[#00ff87] transition-colors cursor-pointer"
          >
            Redefinir Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => {
            const slotsAvailable = task.slotsTotal - task.slotsFilled;
            const totalWithBonus = task.basePay + (task.hasActiveBonus ? task.videoBonus : 0);

            return (
              <div
                key={task.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 hover:bg-slate-900 hover:border-[#00e575]/40 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-black/60"
              >
                {/* Card Header & Media preview */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                  <img
                    src={task.image}
                    alt={task.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30 pointer-events-none" />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-md border border-white/10">
                      {task.locationType === 'workplace' ? '👷 No Trabalho' : '🛋️ Em Casa'}
                    </span>
                    <span className="text-[11px] font-medium bg-black/70 backdrop-blur-md text-slate-300 px-2 py-1 rounded-md border border-white/10">
                      {task.category}
                    </span>
                  </div>

                  {/* Urgent / Active Bonus Badge */}
                  {task.hasActiveBonus && (
                    <div className="absolute top-3 right-3 bg-[#00e575] text-slate-950 font-extrabold text-[11px] px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-current" />
                      <span>+R$ {task.videoBonus} BÔNUS</span>
                    </div>
                  )}

                  {/* Bottom Duration / Posted Tag */}
                  <div className="absolute bottom-2.5 left-3 text-[11px] text-slate-300 font-medium flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      ~{task.durationMinutes} min
                    </span>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span>{task.postedDate}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs text-slate-400 font-medium truncate">
                      {task.company}
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#00e575] transition-colors line-clamp-2 leading-snug">
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {/* Bonus Condition Highlight */}
                  {task.hasActiveBonus && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-[#00e575]/20 text-xs text-emerald-300/90 leading-tight">
                      <span className="font-bold text-[#00e575] block mb-0.5">
                        Critério do Bônus em Vídeo:
                      </span>
                      {task.bonusCondition}
                    </div>
                  )}

                  {/* Compensation & Slots */}
                  <div className="pt-3 border-t border-white/10 flex items-end justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        Ganhos Estimados
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-extrabold text-white font-mono">
                          R$ {totalWithBonus.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400">
                          / {task.payType}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Base: R$ {task.basePay} + Bônus: R$ {task.videoBonus}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-end gap-1">
                        <Users className="w-3 h-3 text-[#00e575]" />
                        <span>{slotsAvailable} vagas hoje</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {task.slotsFilled} já enviaram
                      </div>
                    </div>
                  </div>

                  {/* Primary Card Button */}
                  <button
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className="w-full py-3 sm:py-2.5 px-4 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all shadow-md shadow-[#00e575]/20 flex items-center justify-center gap-1.5 cursor-pointer hover:-translate-y-0.5 active:scale-98"
                  >
                    <Video className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                    <span>Ver Instruções & Gravar</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-950 ml-0.5 shrink-0" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Propose Company Post Banner */}
      <div className="mt-10 sm:mt-12 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 p-5 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-1.5 text-left">
          <span className="text-xs font-bold text-[#00e575] uppercase tracking-wider">
            Para Empresas & Pesquisadores
          </span>
          <h3 className="text-lg sm:text-2xl font-bold text-white font-display">
            Precisa de gravações de tarefas reais para treinar modelos de IA?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Publique tarefas diárias personalizadas na FreelasHub com taxa de bônus em vídeo. Nossa comunidade de freelancers em todo o Brasil entrega vídeos POV validados em até 24 horas.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateTask}
          className="w-full md:w-auto text-center shrink-0 px-5 py-3 text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
        >
          Publicar Tarefa Diária
        </button>
      </div>
    </section>
  );
};
