/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  PhoneCall,
  Share2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Task } from '../types';
import { getTaskCanonicalPath, slugify } from '../utils/slugify';
import { applySeoMetadata, generateJobPostingSchema, generateBreadcrumbSchema, isTaskExpired } from '../services/seoService';
import { getRecommendedTasks } from '../services/searchService';
import { analytics } from '../services/analytics';

interface JobDetailPageProps {
  task: Task;
  allTasks: Task[];
  onBack: () => void;
  onNavigateToTask: (task: Task) => void;
  onNavigateToCategory: (category: string) => void;
  onNavigateToCity: (city: string) => void;
  onOpenApplyModal?: (task: Task) => void;
}

export const JobDetailPage: React.FC<JobDetailPageProps> = ({
  task,
  allTasks,
  onBack,
  onNavigateToTask,
  onNavigateToCategory,
  onNavigateToCity,
  onOpenApplyModal,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const canonicalPath = getTaskCanonicalPath(task);
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${canonicalPath}` : canonicalPath;

  // Track page view and configure dynamic SEO + JobPosting JSON-LD
  useEffect(() => {
    const jobPostingSchema = generateJobPostingSchema(task);
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Vagas', url: '/vagas' },
      { name: task.city || 'São Paulo', url: `/local/sp/${slugify(task.city || 'sao-paulo')}` },
      { name: task.title, url: canonicalPath },
    ]);

    applySeoMetadata({
      title: `${task.title} - R$ ${task.basePay}/h em ${task.city || 'Brasil'} | FreelaHub`,
      description: `${task.description.slice(0, 155)}... Vaga de ${task.category} com remuneração de R$ ${task.basePay}/h e pagamento garantido via PIX.`,
      canonicalUrl,
      ogType: 'article',
      ogImage: task.image || undefined,
      structuredDataJson: [jobPostingSchema, breadcrumbSchema].filter((s): s is object => s !== null),
    });

    analytics.track('job_view', {
      job_id: task.id,
      job_title: task.title,
      category: task.category,
      city: task.city || 'Desconhecida',
    });

    // Cleanup SEO when unmounting
    return () => {
      const dynamicScripts = document.querySelectorAll('script[data-dynamic-seo="true"]');
      dynamicScripts.forEach((s) => s.remove());
    };
  }, [task, canonicalPath, canonicalUrl]);

  const recommended = getRecommendedTasks(task, allTasks, 3);

  const handleCopyPhone = () => {
    if (task.contractorPhone) {
      navigator.clipboard.writeText(task.contractorPhone);
      setCopiedPhone(true);
      analytics.track('job_contact_click', { job_id: task.id, method: 'copy_phone' });
      setTimeout(() => setCopiedPhone(false), 2500);
    }
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopiedUrl(true);
    analytics.track('job_share', { job_id: task.id, url: canonicalUrl });
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    if (task.contractorWhatsapp || task.contractorPhone) {
      const num = (task.contractorWhatsapp || task.contractorPhone || '').replace(/\D/g, '');
      const text = encodeURIComponent(`Olá! Vi sua vaga "${task.title}" no FreelaHub e gostaria de me candidatar.`);
      analytics.track('whatsapp_click', { job_id: task.id, target: 'contractor' });
      window.open(`https://wa.me/${num}?text=${text}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* Top Breadcrumb & Navigation Bar */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#00a859] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para as vagas</span>
          </button>

          {/* Social Share Button */}
          <button
            type="button"
            onClick={handleCopyShareUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Copiar link canônico permanente da vaga"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copiedUrl ? 'Link Copiado!' : 'Compartilhar'}</span>
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Breadcrumbs List */}
        <ol className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 font-medium">
          <li>
            <button type="button" onClick={onBack} className="hover:text-slate-800 transition-colors">
              FreelaHub
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <button type="button" onClick={onBack} className="hover:text-slate-800 transition-colors">
              Vagas
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <button
              type="button"
              onClick={() => task.city && onNavigateToCity(task.city)}
              className="hover:text-slate-800 transition-colors"
            >
              {task.city || 'São Paulo'}
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">
            {task.title}
          </li>
        </ol>

        {/* Hero Card */}
        <header className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToCategory(task.category)}
                  className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#008744] border border-emerald-200/80 text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  {task.category}
                </button>

                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                  {task.locationType === 'home' ? '🛋️ Em casa / Remoto' : '👷 Presencial / No local'}
                </span>

                {task.isDailyMission && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Missão 24h (Expira em {task.expiresInHours || 24}h)
                  </span>
                )}

                {isTaskExpired(task) ? (
                  <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Vaga Encerrada / Expirada
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#00a859]" />
                    Vaga Ativa
                  </span>
                )}
              </div>

              {/* H1 Title for SEO & Screen Readers */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {task.title}
              </h1>

              {/* Company & Location Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 pt-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{task.company}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>
                    {task.city ? `${task.city} - ${task.state || 'SP'}` : 'São Paulo - SP'}
                    {task.neighborhood ? ` (${task.neighborhood})` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Publicada: {task.postedDate}</span>
                </div>
              </div>
            </div>

            {/* Compensation & CTA Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 md:w-72 shrink-0 flex flex-col space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Remuneração Oficial
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black text-[#00a859] font-sans">
                    R$ {task.basePay}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">/{task.payType}</span>
                </div>
                {task.hasActiveBonus && task.videoBonus > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    + R$ {task.videoBonus} Bônus em Vídeo
                  </span>
                )}
              </div>

              {/* Direct Apply / Contact Button */}
              {isTaskExpired(task) ? (
                <div className="w-full py-3 bg-slate-200 text-slate-500 font-bold text-sm rounded-xl text-center select-none">
                  Vaga Encerrada
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="w-full py-3 bg-[#00a859] hover:bg-[#00964f] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#00a859]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Conversar no WhatsApp</span>
                  </button>

                  {onOpenApplyModal && (
                    <button
                      type="button"
                      onClick={() => onOpenApplyModal(task)}
                      className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#008744] font-bold text-xs rounded-xl transition-all border border-emerald-200/80 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Candidatar-se na Plataforma</span>
                    </button>
                  )}
                </>
              )}

              {task.contractorPhone && (
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedPhone ? 'Telefone Copiado!' : task.contractorPhone}</span>
                </button>
              )}

              <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00a859] shrink-0" />
                <span>Pagamento protegido via PIX</span>
              </div>
            </div>
          </div>
        </header>

        {/* Detailed Sections (Semantic HTML) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Description & Requisitos */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <section className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#00a859]" />
                <span>Descrição Completa da Vaga</span>
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {task.description}
              </p>
            </section>

            {/* Requirements */}
            {task.requirements && task.requirements.length > 0 && (
              <section className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a859]" />
                  <span>Requisitos Necessários</span>
                </h2>
                <ul className="space-y-2 text-sm text-slate-700">
                  {task.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a859] mt-2 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Equipment Needed */}
            {task.equipmentNeeded && task.equipmentNeeded.length > 0 && (
              <section className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00a859]" />
                  <span>Equipamentos Recomendados</span>
                </h2>
                <ul className="space-y-2 text-sm text-slate-700">
                  {task.equipmentNeeded.map((eq, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                      <span>{eq}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right Column: Contractor Info & Internal Links */}
          <aside className="space-y-6">
            {/* Contractor Card */}
            <section className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                Dados do Contratante
              </h2>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Responsável</span>
                  <span className="font-semibold text-slate-800">{task.contractorContactName || task.company}</span>
                </div>
                {task.contractorRole && (
                  <div>
                    <span className="text-slate-500 block">Cargo / Departamento</span>
                    <span className="font-semibold text-slate-800">{task.contractorRole}</span>
                  </div>
                )}
                {task.contractorPhone && (
                  <div>
                    <span className="text-slate-500 block">Contato Telefônico</span>
                    <span className="font-mono font-bold text-emerald-800">{task.contractorPhone}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Location Entity Card */}
            <section className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-3 text-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                Localização & Proximidade
              </h2>
              <div className="space-y-1.5 text-slate-700">
                <p>
                  <strong>Cidade:</strong> {task.city || 'São Paulo'}
                </p>
                <p>
                  <strong>Estado:</strong> {task.state || 'SP'} - Brasil
                </p>
                {task.neighborhood && (
                  <p>
                    <strong>Bairro:</strong> {task.neighborhood}
                  </p>
                )}
                {task.latitude && task.longitude && (
                  <p className="text-[11px] font-mono text-slate-500">
                    Coords: {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => task.city && onNavigateToCity(task.city)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1"
              >
                <span>Ver mais vagas em {task.city || 'São Paulo'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </section>
          </aside>
        </div>

        {/* Recommended & Similar Jobs (Internal Linking - Section 14) */}
        {recommended.length > 0 && (
          <section className="pt-6 border-t border-slate-200/80 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Oportunidades Semelhantes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommended.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigateToTask(item)}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-[#00a859] transition-all cursor-pointer shadow-2xs hover:shadow-xs space-y-2"
                >
                  <span className="text-[10.5px] font-bold text-[#008744] bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="font-bold text-[#00a859]">R$ {item.basePay}/h</span>
                    <span className="text-slate-500 text-[11px]">{item.city || 'São Paulo'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </article>
  );
};
