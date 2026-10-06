import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  ShieldAlert,
  Save,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  Plus,
  Trash2,
  Bell,
  Eye,
  FileCheck,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdminAssistantConfig, PlatformSettings, VideoSubmission } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantConfig: AdminAssistantConfig;
  onSaveAssistantConfig: (config: AdminAssistantConfig) => void;
  platformSettings: PlatformSettings;
  onSavePlatformSettings: (settings: PlatformSettings) => void;
  submissions: VideoSubmission[];
  onApproveSubmission?: (id: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  assistantConfig,
  onSaveAssistantConfig,
  platformSettings,
  onSavePlatformSettings,
  submissions,
  onApproveSubmission,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'ai' | 'business' | 'moderation'>('ai');

  // AI Assistant Form State
  const [assistantName, setAssistantName] = useState(assistantConfig.assistantName);
  const [model, setModel] = useState(assistantConfig.model);
  const [temperature, setTemperature] = useState(assistantConfig.temperature);
  const [welcomeMessage, setWelcomeMessage] = useState(assistantConfig.welcomeMessage);
  const [systemInstruction, setSystemInstruction] = useState(assistantConfig.systemInstruction);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([...assistantConfig.quickPrompts]);
  const [newQuickPrompt, setNewQuickPrompt] = useState('');

  // Business Rules Form State
  const [defaultBasePay, setDefaultBasePay] = useState(platformSettings.defaultBasePay);
  const [defaultVideoBonus, setDefaultVideoBonus] = useState(platformSettings.defaultVideoBonus);
  const [maxDeliveryHours, setMaxDeliveryHours] = useState(platformSettings.maxDeliveryHoursForBonus);
  const [autoApprovePix, setAutoApprovePix] = useState(platformSettings.autoApprovePix);
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(platformSettings.isAnnouncementActive);
  const [announcementText, setAnnouncementText] = useState(platformSettings.announcementBannerText);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Add quick prompt
  const handleAddQuickPrompt = () => {
    if (!newQuickPrompt.trim()) return;
    setQuickPrompts([...quickPrompts, newQuickPrompt.trim()]);
    setNewQuickPrompt('');
  };

  // Remove quick prompt
  const handleRemoveQuickPrompt = (index: number) => {
    setQuickPrompts(quickPrompts.filter((_, i) => i !== index));
  };

  // Save all settings
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedAssistant: AdminAssistantConfig = {
      assistantName: assistantName.trim(),
      model,
      temperature,
      welcomeMessage: welcomeMessage.trim(),
      systemInstruction: systemInstruction.trim(),
      quickPrompts,
    };

    const updatedPlatform: PlatformSettings = {
      defaultBasePay: Number(defaultBasePay),
      defaultVideoBonus: Number(defaultVideoBonus),
      maxDeliveryHoursForBonus: Number(maxDeliveryHours),
      autoApprovePix,
      announcementBannerText: announcementText.trim(),
      isAnnouncementActive,
    };

    onSaveAssistantConfig(updatedAssistant);
    onSavePlatformSettings(updatedPlatform);

    setSavedSuccess(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00e575', '#ffffff', '#38bdf8'],
    });

    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto sm:my-8 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92dvh] sm:max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-display">
                  Área Administrativa & Controle da IA
                </h3>
                <span className="text-[10px] bg-emerald-950 border border-[#00e575]/40 text-[#00e575] font-semibold px-2 py-0.5 rounded">
                  Ao Vivo
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">
                Ajuste instruções do Gemini, regras de bônus e valores em tempo real.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/40 px-3 sm:px-6 gap-2 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto whitespace-nowrap no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-3 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'ai'
                ? 'border-[#00e575] text-[#00e575]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Configurações Gemini</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={`py-3 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'business'
                ? 'border-[#00e575] text-[#00e575]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>Regras de Negócio & PIX</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={`py-3 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'moderation'
                ? 'border-[#00e575] text-[#00e575]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            <span>Auditoria ({submissions.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSaveAll} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-[#00e575]/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-[#00e575] shrink-0" />
              <span>Configurações salvas e aplicadas em tempo real em toda a plataforma!</span>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Nome do Assistente
                  </label>
                  <input
                    type="text"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Modelo do Google Gemini
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  >
                    <option value="gemini-3.8-flash">gemini-3.8-flash (Recomendado / Rápido)</option>
                    <option value="gemini-flash-latest">gemini-flash-latest</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Temperatura (Criatividade)</span>
                    <span className="text-[#00e575] font-mono font-bold">{temperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full accent-[#00e575] bg-slate-950 h-2 rounded-lg cursor-pointer mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.0 (Mais Preciso)</span>
                    <span>1.0 (Mais Criativo)</span>
                  </div>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Mensagem Inicial de Boas-Vindas
                </label>
                <textarea
                  rows={2}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00e575]"
                />
              </div>

              {/* System Instructions / Prompt Engineering */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00e575]" />
                    Instruções de Sistema (System Prompt do Gemini)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Define o comportamento, tom e conhecimento técnico do bot
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-[#00e575]"
                  placeholder="Escreva aqui as instruções que guiam o comportamento do assistente..."
                />
              </div>

              {/* Quick Prompt Chips */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Botões de Perguntas Rápidas (Chips de 1 clique)
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((chip, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-slate-950 border border-white/10 px-2.5 py-1 rounded-lg text-xs text-slate-300"
                    >
                      <span>{chip}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuickPrompt(idx)}
                        className="text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newQuickPrompt}
                    onChange={(e) => setNewQuickPrompt(e.target.value)}
                    placeholder="Adicionar nova pergunta frequente..."
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuickPrompt}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Valor Base Padrão Sugerido (R$/h)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    value={defaultBasePay}
                    onChange={(e) => setDefaultBasePay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Bônus em Vídeo Padrão Sugerido (R$)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="150"
                    value={defaultVideoBonus}
                    onChange={(e) => setDefaultVideoBonus(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Janela Limite para Bônus (Horas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={maxDeliveryHours}
                    onChange={(e) => setMaxDeliveryHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                  />
                </div>
              </div>

              {/* Auto approve toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Aprovação Imediata de Saques PIX
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Quando ativado, libera o crédito do freelancer instantaneamente após a auditoria do vídeo.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApprovePix}
                    onChange={(e) => setAutoApprovePix(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00e575]" />
                </label>
              </div>

              {/* Top Announcement Banner Toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#00e575]" />
                    Banner de Aviso no Topo da Página
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnnouncementActive}
                      onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00e575]" />
                  </label>
                </div>

                {isAnnouncementActive && (
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Texto do aviso promocional..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  Submissões de Vídeo Recentes
                </span>
                <span className="text-xs text-slate-400">
                  {submissions.length} vídeos gravados
                </span>
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-white/5 rounded-xl">
                  Nenhuma submissão aguardando auditoria no momento.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl bg-slate-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{sub.taskTitle}</span>
                          <span className="text-[10px] bg-[#00e575]/15 text-[#00e575] px-1.5 py-0.2 rounded font-semibold">
                            {sub.status === 'approved' ? '✓ Aprovado' : 'Em Análise'}
                          </span>
                        </div>
                        <div className="text-slate-400 flex flex-wrap gap-2 text-[11px]">
                          <span>Freelancer: <strong className="text-slate-200">{sub.freelancerName}</strong></span>
                          <span>·</span>
                          <span>Chave PIX: <strong className="text-slate-200">{sub.pixKey}</strong></span>
                          <span>·</span>
                          <span>Arquivo: <span className="font-mono">{sub.videoFileName}</span></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] block">Total PIX:</span>
                          <span className="font-mono font-bold text-[#00e575] text-sm">
                            R$ {sub.totalEarned.toFixed(2)}
                          </span>
                        </div>

                        {onApproveSubmission && sub.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => onApproveSubmission(sub.id)}
                            className="px-3 py-1.5 bg-[#00e575] hover:bg-[#00ff87] text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Aprovar & Pagar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-slate-400 text-center sm:text-left">
              As alterações surtem efeito instantâneo em toda a plataforma.
            </span>

            <div className="flex gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-3 sm:py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer text-center"
              >
                Fechar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-3 sm:py-2.5 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all shadow-md shadow-[#00e575]/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
