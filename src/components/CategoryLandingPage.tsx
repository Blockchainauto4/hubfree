/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ArrowLeft, MapPin, Sparkles, ChevronRight, Phone, Building2, Flame } from 'lucide-react';
import { Task } from '../types';
import { getTaskCanonicalPath, slugify } from '../utils/slugify';
import { applySeoMetadata, generateBreadcrumbSchema } from '../services/seoService';
import { analytics } from '../services/analytics';

interface CategoryLandingPageProps {
  type: 'category' | 'city';
  value: string;
  tasks: Task[];
  onBack: () => void;
  onSelectTask: (task: Task) => void;
  onOpenDailyMissions: () => void;
}

export const CategoryLandingPage: React.FC<CategoryLandingPageProps> = ({
  type,
  value,
  tasks,
  onBack,
  onSelectTask,
  onOpenDailyMissions,
}) => {
  const isCategory = type === 'category';
  const displayTitle = isCategory ? `Vagas de ${value}` : `Vagas em ${value} - SP`;
  const canonicalPath = isCategory ? `/categorias/${slugify(value)}` : `/local/sp/${slugify(value)}`;
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${canonicalPath}` : canonicalPath;

  const filteredTasks = tasks.filter((t) => {
    if (isCategory) {
      return t.category?.toLowerCase() === value.toLowerCase();
    }
    return t.city?.toLowerCase() === value.toLowerCase();
  });

  useEffect(() => {
    const breadcrumb = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Vagas', url: '/vagas' },
      { name: value, url: canonicalPath },
    ]);

    applySeoMetadata({
      title: `${displayTitle} | FreelaHub Oportunidades`,
      description: `Encontre vagas e oportunidades de freelancer em ${value}. Remuneração de até R$ 75/h, bônus em vídeo e pagamento garantido via PIX.`,
      canonicalUrl,
      ogType: 'website',
      structuredDataJson: [breadcrumb],
    });

    analytics.track('category_view', { type, value });

    return () => {
      const dynamicScripts = document.querySelectorAll('script[data-dynamic-seo="true"]');
      dynamicScripts.forEach((s) => s.remove());
    };
  }, [type, value, canonicalPath, canonicalUrl, displayTitle]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <nav aria-label="Navegação" className="bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#00a859] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para todas as vagas</span>
          </button>
          <span className="text-xs font-bold text-slate-500">{filteredTasks.length} vagas encontradas</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        <header className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-[#008744] uppercase tracking-wider">
            {isCategory ? 'Categoria Profissional' : 'Descoberta Regional'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            {isCategory
              ? `Confira as postagens disponíveis para profissionais de ${value}. Todas as vagas contam com contato direto e remuneração via PIX.`
              : `Oportunidades de trabalho e tarefas freelancer abertas na região de ${value}. Encontre vagas presenciais e em casa.`}
          </p>
        </header>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <h2 className="font-bold text-slate-800 text-sm">Nenhuma vaga aberta no momento para esta seleção</h2>
            <p className="text-xs text-slate-500">Novas postagens são adicionadas diariamente pela equipe FreelaHub.</p>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-[#00a859] text-white text-xs font-bold rounded-xl"
            >
              Ver todas as vagas
            </button>
          </div>
        ) : (
          <section className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-[#00a859] transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#008744] text-[11px] font-bold">
                      {task.category}
                    </span>
                    {task.isDailyMission && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10.5px] font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" />
                        Expira em {task.expiresInHours || 24}h
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{task.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span>{task.company}</span>
                    <span>·</span>
                    <span>{task.city || 'São Paulo'}</span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Remuneração</span>
                    <span className="text-xl font-black text-[#00a859]">R$ {task.basePay}/h</span>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-[#00a859] text-white text-xs font-bold rounded-xl sm:mt-2"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};
