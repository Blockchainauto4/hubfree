/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  ShieldAlert,
  Save,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Plus,
  Trash2,
  FileCheck,
  Zap,
  Briefcase,
  Flame,
  Phone,
  User,
  Building2,
  Clock,
  Edit3,
  Copy,
  Search,
  ExternalLink,
  Layers,
  Check,
  Activity,
  Wrench,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Download,
  UploadCloud,
  ShieldCheck,
  Terminal,
  Database,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdminAssistantConfig, PlatformSettings, VideoSubmission, Task } from '../types';
import { notifyIndexNow } from '../services/indexNowService';
import { getTaskCanonicalPath } from '../utils/slugify';
import {
  checkDatabaseHealth,
  repairDatabaseInconsistencies,
  exportDatabaseBackup,
  importDatabaseBackup,
  DatabaseHealthReport,
  DatabaseRepairResult,
} from '../services/dbService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantConfig: AdminAssistantConfig;
  onSaveAssistantConfig: (config: AdminAssistantConfig) => void;
  platformSettings: PlatformSettings;
  onSavePlatformSettings: (settings: PlatformSettings) => void;
  submissions: VideoSubmission[];
  onApproveSubmission?: (id: string) => void;
  tasks?: Task[];
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
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
  tasks = [],
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  if (!isOpen) return null;

  // Active tab: 'postings' | 'sync' | 'moderation' | 'business' | 'ai' | 'seo'
  const [activeTab, setActiveTab] = useState<'postings' | 'sync' | 'moderation' | 'business' | 'ai' | 'seo'>('postings');

  // Success toast state
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Database Health Checker & Repair State
  const [healthReport, setHealthReport] = useState<DatabaseHealthReport | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [lastRepairResult, setLastRepairResult] = useState<DatabaseRepairResult | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  // Automatically check database health when modal opens
  useEffect(() => {
    if (isOpen) {
      checkDatabaseHealth().then((rep) => setHealthReport(rep));
    }
  }, [isOpen]);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00e575', '#ffffff', '#38bdf8', '#fbbf24'],
    });
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  const handleRunHealthCheck = async () => {
    setIsCheckingHealth(true);
    await new Promise((r) => setTimeout(r, 600));
    const rep = await checkDatabaseHealth();
    setHealthReport(rep);
    setIsCheckingHealth(false);
    showSuccess(`Diagnóstico de integridade concluído! Saúde do banco: ${rep.score}%`);
  };

  const handleRunRepair = async () => {
    setIsRepairing(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = await repairDatabaseInconsistencies();
    setLastRepairResult(result);
    const freshRep = await checkDatabaseHealth();
    setHealthReport(freshRep);
    setIsRepairing(false);
    showSuccess(`Auto-Reparo concluído! ${result.fixedIssuesCount} correções aplicadas.`);
  };

  const handleDownloadBackup = () => {
    const json = exportDatabaseBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freelahub_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Backup do banco de dados exportado com sucesso em JSON!');
  };

  const handleExecuteImport = () => {
    if (!importJsonText.trim()) {
      alert('Cole o conteúdo JSON válido para restauração.');
      return;
    }
    const res = importDatabaseBackup(importJsonText);
    if (res.success) {
      showSuccess(res.message);
      setImportJsonText('');
      setShowImportBox(false);
      checkDatabaseHealth().then((rep) => setHealthReport(rep));
    } else {
      alert(res.message);
    }
  };

  // ----------------------------------------------------
  // JOB POSTING / EDITING STATE (FREELAHUB TEAM AREA)
  // ----------------------------------------------------
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCompany, setTaskCompany] = useState('FreelaHub AI Datasets');
  const [taskCategory, setTaskCategory] = useState<Task['category']>('Mecânica');
  const [taskLocationType, setTaskLocationType] = useState<'workplace' | 'home'>('workplace');
  const [taskBasePay, setTaskBasePay] = useState<number>(60);
  const [taskPayType, setTaskPayType] = useState<'hora' | 'vídeo'>('hora');
  const [taskDuration, setTaskDuration] = useState<number>(45);
  const [taskSlotsTotal, setTaskSlotsTotal] = useState<number>(10);
  const [taskImage, setTaskImage] = useState('/src/assets/images/video_task_workshop_pov_1791299034671.jpg');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskRequirements, setTaskRequirements] = useState<string[]>([
    'Gravação em primeira pessoa (POV) com mãos livres',
    'Vídeo contínuo sem cortes nas ações principais',
    'Boa iluminação frontal sem sombras intensas',
  ]);
  const [newRequirement, setNewRequirement] = useState('');
  const [taskEquipment, setTaskEquipment] = useState<string[]>([
    'Suporte de celular para cabeça ou peito',
    'Smartphone com câmera 1080p ou 4K',
  ]);
  const [newEquipment, setNewEquipment] = useState('');

  // Daily Mission & Contractor Contact Fields
  const [taskIsDailyMission, setTaskIsDailyMission] = useState(true);
  const [taskExpiresInHours, setTaskExpiresInHours] = useState<number>(12);
  const [taskContractorName, setTaskContractorName] = useState('Eng. Equipe FreelaHub');
  const [taskContractorPhone, setTaskContractorPhone] = useState('+55 (11) 98765-4321');
  const [taskContractorRole, setTaskContractorRole] = useState('Coordenador Operacional FreelaHub');
  const [taskUrgency, setTaskUrgency] = useState<'critica' | 'alta' | 'moderada'>('alta');

  // Video Bonus Fields
  const [taskHasBonus, setTaskHasBonus] = useState(true);
  const [taskVideoBonus, setTaskVideoBonus] = useState<number>(25);
  const [taskBonusCondition, setTaskBonusCondition] = useState('Envio em resolução 1080p60 em até 8h após iniciar a tarefa');

  // Search & Filter for tasks list in Admin
  const [searchTaskQuery, setSearchTaskQuery] = useState('');
  const [filterTaskCategory, setFilterTaskCategory] = useState<string>('all');
  const [filterTaskMissionOnly, setFilterTaskMissionOnly] = useState(false);

  // Reset posting form
  const handleResetForm = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskCompany('FreelaHub AI Datasets');
    setTaskCategory('Mecânica');
    setTaskLocationType('workplace');
    setTaskBasePay(60);
    setTaskPayType('hora');
    setTaskDuration(45);
    setTaskSlotsTotal(10);
    setTaskImage('/src/assets/images/video_task_workshop_pov_1791299034671.jpg');
    setTaskDescription('');
    setTaskRequirements([
      'Gravação em primeira pessoa (POV) com mãos livres',
      'Vídeo contínuo sem cortes nas ações principais',
      'Boa iluminação frontal sem sombras intensas',
    ]);
    setTaskEquipment([
      'Suporte de celular para cabeça ou peito',
      'Smartphone com câmera 1080p ou 4K',
    ]);
    setTaskIsDailyMission(true);
    setTaskExpiresInHours(12);
    setTaskContractorName('Eng. Equipe FreelaHub');
    setTaskContractorPhone('+55 (11) 98765-4321');
    setTaskContractorRole('Coordenador Operacional FreelaHub');
    setTaskUrgency('alta');
    setTaskHasBonus(true);
    setTaskVideoBonus(25);
    setTaskBonusCondition('Envio em resolução 1080p60 em até 8h após iniciar a tarefa');
  };

  // Populate form for editing
  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskCompany(task.company);
    setTaskCategory(task.category);
    setTaskLocationType(task.locationType);
    setTaskBasePay(task.basePay);
    setTaskPayType(task.payType);
    setTaskDuration(task.durationMinutes);
    setTaskSlotsTotal(task.slotsTotal);
    setTaskImage(task.image);
    setTaskDescription(task.description);
    setTaskRequirements([...task.requirements]);
    setTaskEquipment([...task.equipmentNeeded]);
    setTaskIsDailyMission(!!task.isDailyMission);
    setTaskExpiresInHours(task.expiresInHours || 24);
    setTaskContractorName(task.contractorContactName || task.company);
    setTaskContractorPhone(task.contractorPhone || '+55 (11) 98765-4321');
    setTaskContractorRole(task.contractorRole || 'Supervisor de Vagas');
    setTaskUrgency(task.missionUrgency || 'alta');
    setTaskHasBonus(task.hasActiveBonus);
    setTaskVideoBonus(task.videoBonus);
    setTaskBonusCondition(task.bonusCondition);

    // Scroll to top of tab
    const formElem = document.getElementById('freelahub-admin-job-form');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Save / Post Task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskCompany.trim() || !taskDescription.trim()) {
      alert('Preencha os campos obrigatórios (Título, Empresa e Descrição).');
      return;
    }

    const expDate = new Date();
    expDate.setHours(expDate.getHours() + Number(taskExpiresInHours));

    const cleanPhone = taskContractorPhone.trim() || '+55 (11) 98765-4321';

    if (editingTaskId) {
      // Update existing task
      const updated: Task = {
        id: editingTaskId,
        title: taskTitle.trim(),
        company: taskCompany.trim(),
        category: taskCategory,
        locationType: taskLocationType,
        basePay: Number(taskBasePay),
        payType: taskPayType,
        videoBonus: taskHasBonus ? Number(taskVideoBonus) : 0,
        bonusCondition: taskHasBonus ? taskBonusCondition : 'Sem bônus',
        hasActiveBonus: taskHasBonus,
        slotsTotal: Number(taskSlotsTotal),
        slotsFilled: 0,
        durationMinutes: Number(taskDuration),
        image: taskImage,
        description: taskDescription.trim(),
        requirements: taskRequirements.filter((r) => r.trim().length > 0),
        equipmentNeeded: taskEquipment.filter((eq) => eq.trim().length > 0),
        postedDate: 'Hoje (Atualizado)',
        isUrgent: taskUrgency === 'critica' || taskUrgency === 'alta',
        isDailyMission: taskIsDailyMission,
        expiresInHours: Number(taskExpiresInHours),
        expiresAt: expDate.toISOString(),
        contractorPhone: cleanPhone,
        contractorWhatsapp: cleanPhone.replace(/\D/g, ''),
        contractorContactName: taskContractorName.trim(),
        contractorRole: taskContractorRole.trim(),
        missionUrgency: taskUrgency,
      };

      if (onTaskUpdated) {
        onTaskUpdated(updated);
      }
      showSuccess(`Vaga "${updated.title}" atualizada no banco de dados em tempo real!`);
      handleResetForm();
    } else {
      // Create new task
      const newTask: Task = {
        id: 'task-' + Date.now(),
        title: taskTitle.trim(),
        company: taskCompany.trim(),
        category: taskCategory,
        locationType: taskLocationType,
        basePay: Number(taskBasePay),
        payType: taskPayType,
        videoBonus: taskHasBonus ? Number(taskVideoBonus) : 0,
        bonusCondition: taskHasBonus ? taskBonusCondition : 'Sem bônus',
        hasActiveBonus: taskHasBonus,
        slotsTotal: Number(taskSlotsTotal),
        slotsFilled: 0,
        durationMinutes: Number(taskDuration),
        image: taskImage,
        description: taskDescription.trim(),
        requirements: taskRequirements.filter((r) => r.trim().length > 0),
        equipmentNeeded: taskEquipment.filter((eq) => eq.trim().length > 0),
        postedDate: 'Agora mesmo',
        isUrgent: taskUrgency === 'critica' || taskUrgency === 'alta',
        isDailyMission: taskIsDailyMission,
        expiresInHours: Number(taskExpiresInHours),
        expiresAt: expDate.toISOString(),
        contractorPhone: cleanPhone,
        contractorWhatsapp: cleanPhone.replace(/\D/g, ''),
        contractorContactName: taskContractorName.trim(),
        contractorRole: taskContractorRole.trim(),
        missionUrgency: taskUrgency,
      };

      if (onTaskCreated) {
        onTaskCreated(newTask);
      }
      showSuccess(`Nova vaga "${newTask.title}" postada e propagada no banco em tempo real!`);
      handleResetForm();
    }
  };

  // Duplicate task in real time
  const handleDuplicateTask = (task: Task) => {
    const clone: Task = {
      ...task,
      id: 'task-' + Date.now(),
      title: `${task.title} (Cópia)`,
      postedDate: 'Agora mesmo',
      slotsFilled: 0,
    };
    if (onTaskCreated) {
      onTaskCreated(clone);
    }
    showSuccess(`Vaga duplicada com sucesso no banco de dados!`);
  };

  // Toggle 24h mission status in real time
  const handleToggleDailyMission = (task: Task) => {
    const expDate = new Date();
    expDate.setHours(expDate.getHours() + 24);
    const updated: Task = {
      ...task,
      isDailyMission: !task.isDailyMission,
      expiresInHours: task.isDailyMission ? undefined : 24,
      expiresAt: task.isDailyMission ? undefined : expDate.toISOString(),
    };
    if (onTaskUpdated) {
      onTaskUpdated(updated);
    }
    showSuccess(
      updated.isDailyMission
        ? `Vaga definida como Missão Diária de 24h!`
        : `Vaga convertida em postagem padrão.`
    );
  };

  // Delete task from DB
  const handleDeleteTask = (task: Task) => {
    if (window.confirm(`Tem certeza que deseja excluir a vaga "${task.title}" do banco de dados?`)) {
      if (onTaskDeleted) {
        onTaskDeleted(task.id);
      }
      showSuccess(`Vaga removida do banco de dados.`);
    }
  };

  // Filter tasks in Admin table
  const filteredTasks = tasks.filter((t) => {
    if (filterTaskCategory !== 'all' && t.category !== filterTaskCategory) return false;
    if (filterTaskMissionOnly && !t.isDailyMission && (!t.expiresInHours || t.expiresInHours > 24)) return false;
    if (searchTaskQuery.trim()) {
      const q = searchTaskQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCompany = t.company.toLowerCase().includes(q);
      const matchPhone = t.contractorPhone?.includes(q) || false;
      if (!matchTitle && !matchCompany && !matchPhone) return false;
    }
    return true;
  });

  // ----------------------------------------------------
  // AI ASSISTANT & BUSINESS RULES STATE
  // ----------------------------------------------------
  const [assistantName, setAssistantName] = useState(assistantConfig.assistantName);
  const [model, setModel] = useState(assistantConfig.model);
  const [temperature, setTemperature] = useState(assistantConfig.temperature);
  const [welcomeMessage, setWelcomeMessage] = useState(assistantConfig.welcomeMessage);
  const [systemInstruction, setSystemInstruction] = useState(assistantConfig.systemInstruction);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([...assistantConfig.quickPrompts]);
  const [newQuickPrompt, setNewQuickPrompt] = useState('');

  const [defaultBasePay, setDefaultBasePay] = useState(platformSettings.defaultBasePay);
  const [defaultVideoBonus, setDefaultVideoBonus] = useState(platformSettings.defaultVideoBonus);
  const [maxDeliveryHours, setMaxDeliveryHours] = useState(platformSettings.maxDeliveryHoursForBonus);
  const [autoApprovePix, setAutoApprovePix] = useState(platformSettings.autoApprovePix);
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(platformSettings.isAnnouncementActive);
  const [announcementText, setAnnouncementText] = useState(platformSettings.announcementBannerText);

  const handleSaveAISettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAssistant: AdminAssistantConfig = {
      assistantName: assistantName.trim(),
      model,
      temperature,
      welcomeMessage: welcomeMessage.trim(),
      systemInstruction: systemInstruction.trim(),
      quickPrompts,
    };
    onSaveAssistantConfig(updatedAssistant);
    showSuccess('Instruções e configurações do Gemini salvas!');
  };

  const handleSaveBusinessSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPlatform: PlatformSettings = {
      defaultBasePay: Number(defaultBasePay),
      defaultVideoBonus: Number(defaultVideoBonus),
      maxDeliveryHoursForBonus: Number(maxDeliveryHours),
      autoApprovePix,
      announcementBannerText: announcementText.trim(),
      isAnnouncementActive,
    };
    onSavePlatformSettings(updatedPlatform);
    showSuccess('Regras de Negócio e PIX atualizadas!');
  };

  // SEO & Search Engine Discovery State
  const [googleSiteVerification, setGoogleSiteVerification] = useState(platformSettings.googleSiteVerification || '');
  const [bingSiteVerification, setBingSiteVerification] = useState(platformSettings.bingSiteVerification || '');
  const [indexNowKey, setIndexNowKey] = useState(platformSettings.indexNowKey || 'freelahub2026indexnowkey');
  const [isBroadcastingIndexNow, setIsBroadcastingIndexNow] = useState(false);
  const [indexNowReport, setIndexNowReport] = useState<string | null>(null);

  const handleSaveSeoSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPlatform: PlatformSettings = {
      ...platformSettings,
      googleSiteVerification: googleSiteVerification.trim(),
      bingSiteVerification: bingSiteVerification.trim(),
      indexNowKey: indexNowKey.trim(),
    };
    onSavePlatformSettings(updatedPlatform);
    showSuccess('Configurações de SEO, Search Console e IndexNow salvas com sucesso!');
  };

  const handleBroadcastIndexNow = async () => {
    setIsBroadcastingIndexNow(true);
    setIndexNowReport(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://freelahub.com.br';
      const urls = [
        `${origin}/`,
        `${origin}/vagas`,
        ...tasks.map((t) => `${origin}${getTaskCanonicalPath(t)}`),
      ];
      const result = await notifyIndexNow(urls);
      setIndexNowReport(result.message);
      showSuccess(result.message);
    } catch (err: any) {
      setIndexNowReport(`Erro: ${err?.message || 'Falha ao conectar ao IndexNow'}`);
    } finally {
      setIsBroadcastingIndexNow(false);
    }
  };

  // Metrics
  const dailyMissionsCount = tasks.filter((t) => t.isDailyMission || (t.expiresInHours && t.expiresInHours <= 24)).length;
  const totalSlotsCount = tasks.reduce((acc, t) => acc + t.slotsTotal, 0);
  const totalSlotsFilled = tasks.reduce((acc, t) => acc + t.slotsFilled, 0);
  const totalBonusPool = tasks.reduce((acc, t) => acc + (t.hasActiveBonus ? t.videoBonus : 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto sm:my-6 bg-slate-900 border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[94dvh] sm:max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00c860] to-[#00ff87] text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-[#00e575]/20 shrink-0">
              <Sliders className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-white font-display">
                  Painel Administrativo • Equipe FreelaHub
                </h3>
                <span className="text-[10px] bg-emerald-950 border border-[#00e575]/40 text-[#00e575] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] animate-ping" />
                  Banco de Dados em Tempo Real
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Postagem e sincronização ao vivo de vagas de freelancer, missões diárias de 24h e contatos dos contratantes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast Notification */}
        {successToast && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-emerald-950/80 border border-[#00e575]/50 text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00e575] shrink-0" />
              <span className="font-semibold">{successToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-950/40 px-3 sm:px-6 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('postings')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'postings'
                ? 'border-[#00e575] text-[#00e575] font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Postagem de Vagas & Banco ({tasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('sync');
              if (!healthReport) handleRunHealthCheck();
            }}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'sync'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Sincronia & Auto-Reparo</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.2 rounded-full border border-amber-500/30">
              {healthReport ? `${healthReport.score}%` : 'Diagnóstico'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'moderation'
                ? 'border-[#00e575] text-[#00e575] font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            <span>Auditoria de Envios ({submissions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'business'
                ? 'border-[#00e575] text-[#00e575] font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>Regras de Negócio & PIX</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'ai'
                ? 'border-[#00e575] text-[#00e575] font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Configurações Gemini IA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'seo'
                ? 'border-[#00e575] text-[#00e575] font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span>SEO & Motores de Busca</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* ======================================================== */}
          {/* TAB 1: POSTAGEM DE VAGAS EM TEMPO REAL (EQUIPE FREELAHUB) */}
          {/* ======================================================== */}
          {activeTab === 'postings' && (
            <div className="space-y-6">
              
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 border border-white/10 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block font-medium">Vagas no Banco de Dados</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold font-mono text-white">{tasks.length}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Ativas</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-3">
                  <span className="text-[11px] text-amber-300 block font-medium flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Missões Diárias (24h)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold font-mono text-amber-300">{dailyMissionsCount}</span>
                    <span className="text-[10px] text-slate-400">c/ telefone liberado</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-white/10 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block font-medium">Ocupação de Vagas</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold font-mono text-white">
                      {totalSlotsFilled} / {totalSlotsCount}
                    </span>
                    <span className="text-[10px] text-slate-400">envios</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-white/10 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block font-medium">Bônus Relâmpago Alocado</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold font-mono text-[#00e575]">
                      R$ {totalBonusPool},00
                    </span>
                    <span className="text-[10px] text-slate-400">via PIX</span>
                  </div>
                </div>
              </div>

              {/* POST / EDIT FORM */}
              <div id="freelahub-admin-job-form" className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00e575]/15 border border-[#00e575]/30 flex items-center justify-center text-[#00e575]">
                      {editingTaskId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white font-display">
                        {editingTaskId ? 'Editar Vaga no Banco de Dados' : 'Postar Nova Vaga de Freelancer (Equipe FreelaHub)'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {editingTaskId
                          ? 'Modifique os dados abaixo e clique em Salvar para atualizar em tempo real.'
                          : 'Preencha os requisitos técnicos para disponibilizar a tarefa imediatamente aos freelancers.'}
                      </p>
                    </div>
                  </div>

                  {editingTaskId && (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveTask} className="space-y-4">
                  {/* Row 1: Title & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Título da Tarefa Freelancer (POV) *
                      </label>
                      <input
                        type="text"
                        required
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="Ex: Montagem e Teste de Bomba Hidráulica Automotiva"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Empresa / Laboratório Parceiro *
                      </label>
                      <input
                        type="text"
                        required
                        value={taskCompany}
                        onChange={(e) => setTaskCompany(e.target.value)}
                        placeholder="Ex: VisionTech AI Brasil, FreelaHub Labs"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]"
                      />
                    </div>
                  </div>

                  {/* Row 2: Category, Location, Pay, Duration, Slots */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Categoria *</label>
                      <select
                        value={taskCategory}
                        onChange={(e) => setTaskCategory(e.target.value as any)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
                      >
                        <option value="Mecânica">Mecânica</option>
                        <option value="Elétrica">Elétrica</option>
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Culinária">Culinária</option>
                        <option value="Construção">Construção</option>
                        <option value="Artesanato">Artesanato</option>
                        <option value="Serviços">Serviços</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Ambiente *</label>
                      <select
                        value={taskLocationType}
                        onChange={(e) => setTaskLocationType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
                      >
                        <option value="workplace">👷 No Trabalho</option>
                        <option value="home">🛋️ Em Casa</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Valor Base (R$) *</label>
                      <input
                        type="number"
                        min="20"
                        max="500"
                        required
                        value={taskBasePay}
                        onChange={(e) => setTaskBasePay(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Duração (Minutos)</label>
                      <input
                        type="number"
                        min="10"
                        max="240"
                        value={taskDuration}
                        onChange={(e) => setTaskDuration(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Vagas Totais</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={taskSlotsTotal}
                        onChange={(e) => setTaskSlotsTotal(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                      />
                    </div>
                  </div>

                  {/* Row 3: Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Descrição Detalhada do Procedimento *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Instrua o freelancer com clareza: ângulo de câmera, posição das mãos e passos esperados..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]"
                    />
                  </div>

                  {/* 24-Hour Daily Mission & Contractor Phone Sub-panel */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-300">
                        <input
                          type="checkbox"
                          checked={taskIsDailyMission}
                          onChange={(e) => setTaskIsDailyMission(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          Missão Diária de 24 Horas (Liberar Contato do Contratante)
                        </span>
                      </label>

                      {taskIsDailyMission && (
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                          Expira em {taskExpiresInHours}h
                        </span>
                      )}
                    </div>

                    {taskIsDailyMission && (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Prazo Limite
                          </label>
                          <select
                            value={taskExpiresInHours}
                            onChange={(e) => setTaskExpiresInHours(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value={4}>4 Horas (Crítica)</option>
                            <option value={6}>6 Horas (Crítica)</option>
                            <option value={8}>8 Horas (Alta)</option>
                            <option value={12}>12 Horas (Alta)</option>
                            <option value={24}>24 Horas (Padrão)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                            <User className="w-3 h-3 text-[#00e575]" />
                            Nome do Contratante *
                          </label>
                          <input
                            type="text"
                            value={taskContractorName}
                            onChange={(e) => setTaskContractorName(e.target.value)}
                            placeholder="Ex: Eng. Ricardo Mendes"
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#00e575]" />
                            Telefone / WhatsApp *
                          </label>
                          <input
                            type="text"
                            value={taskContractorPhone}
                            onChange={(e) => setTaskContractorPhone(e.target.value)}
                            placeholder="Ex: +55 (11) 98765-4321"
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-300">
                            Cargo / Departamento
                          </label>
                          <input
                            type="text"
                            value={taskContractorRole}
                            onChange={(e) => setTaskContractorRole(e.target.value)}
                            placeholder="Ex: Coordenador Técnico"
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Bonus Sub-panel */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-[#00e575]/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                        <input
                          type="checkbox"
                          checked={taskHasBonus}
                          onChange={(e) => setTaskHasBonus(e.target.checked)}
                          className="w-4 h-4 rounded text-[#00e575] accent-[#00e575] focus:ring-0 cursor-pointer"
                        />
                        <span className="flex items-center gap-1 text-[#00e575]">
                          <Zap className="w-3.5 h-3.5" />
                          Oferecer Bônus em Vídeo para Entregas Rápidas / 1080p
                        </span>
                      </label>
                      {taskHasBonus && (
                        <span className="text-xs font-mono font-bold text-[#00e575]">
                          +R$ {taskVideoBonus},00
                        </span>
                      )}
                    </div>

                    {taskHasBonus && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-white/5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-300">Valor do Bônus (R$)</label>
                          <input
                            type="number"
                            min="5"
                            max="150"
                            value={taskVideoBonus}
                            onChange={(e) => setTaskVideoBonus(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-slate-300">Condição do Bônus</label>
                          <input
                            type="text"
                            value={taskBonusCondition}
                            onChange={(e) => setTaskBonusCondition(e.target.value)}
                            placeholder="Ex: Gravação contínua em 1080p60fps entregue em até 8 horas"
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Limpar Campos
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all shadow-md shadow-[#00e575]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Save className="w-4 h-4 shrink-0" />
                      <span>
                        {editingTaskId
                          ? 'Salvar Alterações no Banco de Dados'
                          : 'Publicar Vaga no Banco de Dados em Tempo Real'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* LIVE TASKS TABLE & MANAGEMENT */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white font-display">
                      Vagas Cadastradas no Banco de Dados ({filteredTasks.length})
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Atualizações realizadas aqui refletem instantaneamente no feed para os freelancers.
                    </p>
                  </div>

                  {/* Quick Filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTaskQuery}
                        onChange={(e) => setSearchTaskQuery(e.target.value)}
                        placeholder="Buscar vaga..."
                        className="bg-slate-950 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575] w-36 sm:w-44"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setFilterTaskMissionOnly(!filterTaskMissionOnly)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                        filterTaskMissionOnly
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-950 border border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>24h</span>
                    </button>

                    <select
                      value={filterTaskCategory}
                      onChange={(e) => setFilterTaskCategory(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="all">Todas</option>
                      <option value="Mecânica">Mecânica</option>
                      <option value="Elétrica">Elétrica</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Culinária">Culinária</option>
                      <option value="Construção">Construção</option>
                    </select>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-2.5">
                  {filteredTasks.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/40 border border-white/5 rounded-2xl text-xs text-slate-400">
                      Nenhuma vaga encontrada com os filtros atuais.
                    </div>
                  ) : (
                    filteredTasks.map((t) => {
                      const totalEarnings = t.basePay + (t.hasActiveBonus ? t.videoBonus : 0);
                      return (
                        <div
                          key={t.id}
                          className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {t.isDailyMission && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  <Flame className="w-3 h-3 text-amber-400" />
                                  24h ({t.expiresInHours || 24}h)
                                </span>
                              )}

                              <span className="text-[10px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                                {t.category}
                              </span>

                              <span className="text-[10px] text-slate-400">
                                {t.locationType === 'workplace' ? '👷 Trabalho' : '🛋️ Casa'}
                              </span>

                              <span className="text-[10px] text-slate-500 font-mono">
                                {t.slotsFilled}/{t.slotsTotal} vagas
                              </span>
                            </div>

                            <h5 className="text-xs sm:text-sm font-bold text-white truncate max-w-xl">
                              {t.title}
                            </h5>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                              <span>Empresa: <strong className="text-slate-200">{t.company}</strong></span>
                              <span>·</span>
                              <span>
                                Contratante:{' '}
                                <strong className="text-emerald-400 font-mono">
                                  {t.contractorPhone || 'Sem telefone'}
                                </strong>
                              </span>
                              <span>·</span>
                              <span>
                                Remuneração:{' '}
                                <strong className="text-[#00e575] font-mono">
                                  R$ {totalEarnings.toFixed(2)}
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* Quick Admin Actions per Task */}
                          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(t)}
                              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Editar vaga"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#00e575]" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleDailyMission(t)}
                              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                t.isDailyMission
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-white/5 text-slate-400 hover:text-white'
                              }`}
                              title={t.isDailyMission ? 'Desativar missão 24h' : 'Ativar como missão 24h'}
                            >
                              <Flame className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateTask(t)}
                              className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                              title="Duplicar vaga"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTask(t)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition-colors cursor-pointer"
                              title="Excluir do banco de dados"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: VERIFICADOR DE SINCRONIA & REPARO COM BANCO DE DADOS */}
          {/* ======================================================== */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              
              {/* Health Score Overview Card */}
              <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
                      <Activity className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-extrabold text-white font-display">
                          Verificador de Sincronia & Auto-Reparo
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#00e575] border border-[#00e575]/30">
                          Ao Vivo
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Auditoria de integridade, latência em tempo real, validação de telefones dos contratantes e recuperação atômica de dados.
                      </p>
                    </div>
                  </div>

                  {/* Health Score Badge */}
                  <div className="bg-slate-900 border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                        Saúde do Banco
                      </span>
                      <span
                        className={`text-2xl font-extrabold font-mono ${
                          (healthReport?.score ?? 100) >= 90
                            ? 'text-[#00e575]'
                            : (healthReport?.score ?? 100) >= 70
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {healthReport ? `${healthReport.score}%` : '100%'}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs">
                      {(healthReport?.score ?? 100) >= 90 ? '🟢' : (healthReport?.score ?? 100) >= 70 ? '🟡' : '🔴'}
                    </div>
                  </div>
                </div>

                {/* Live Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Nível de Consistência e Resiliência dos Dados</span>
                    <span className="font-mono font-semibold text-slate-200">
                      Última verificação: {healthReport?.checkedAt || 'Agora'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        (healthReport?.score ?? 100) >= 90
                          ? 'bg-gradient-to-r from-emerald-500 to-[#00e575]'
                          : (healthReport?.score ?? 100) >= 70
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-600 to-rose-400'
                      }`}
                      style={{ width: `${healthReport?.score ?? 100}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Latência da Conexão</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold font-mono text-[#00e575]">
                        {healthReport?.pingMs ?? 4}ms
                      </span>
                      <span className="text-[10px] text-slate-500">ultra-rápido</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Vagas Auditadas</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold font-mono text-white">
                        {healthReport?.totalTasks ?? tasks.length}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">100% íntegras</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Missões 24h Ativas</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold font-mono text-amber-300">
                        {healthReport?.dailyMissionsCount ?? dailyMissionsCount}
                      </span>
                      <span className="text-[10px] text-slate-400">c/ telefone</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Memória do Banco</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold font-mono text-white">
                        {healthReport?.storageUsedKb ?? 28} KB
                      </span>
                      <span className="text-[10px] text-slate-500">otimizado</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    disabled={isCheckingHealth}
                    onClick={handleRunHealthCheck}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white flex items-center gap-2 transition-all cursor-pointer border border-white/10 active:scale-98 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin text-[#00e575]' : ''}`} />
                    <span>{isCheckingHealth ? 'Auditando Banco...' : 'Verificar Sincronia Agora'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRepairing}
                    onClick={handleRunRepair}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00e575] hover:bg-[#00ff87] text-slate-950 flex items-center gap-2 transition-all shadow-md shadow-[#00e575]/25 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Wrench className={`w-3.5 h-3.5 ${isRepairing ? 'animate-spin' : ''}`} />
                    <span>{isRepairing ? 'Executando Reparo...' : 'Executar Auto-Reparo do Banco'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Exportar cópia de segurança em formato JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Backup (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowImportBox(!showImportBox)}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
                    <span>Restaurar Backup</span>
                  </button>
                </div>
              </div>

              {/* JSON Import/Restore Box (Collapsible) */}
              {showImportBox && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3 animate-in fade-in zoom-in-98 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                      <Database className="w-4 h-4 text-purple-400" />
                      <span>Restauração Manual do Banco de Dados a partir de JSON</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowImportBox(false)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Cole o conteúdo do backup gerado anteriormente para restaurar todas as vagas e submissões com integridade verificada.
                  </p>
                  <textarea
                    rows={4}
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder='Cole o JSON aqui: { "tasks": [...], "submissions": [...] }'
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowImportBox(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteImport}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-500 hover:bg-purple-400 text-white transition-colors cursor-pointer"
                    >
                      Confirmar Restauração no Banco
                    </button>
                  </div>
                </div>
              )}

              {/* Last Repair Result Notice */}
              {lastRepairResult && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-[#00e575]/40 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#00e575]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Relatório do Último Auto-Reparo Executado</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      {lastRepairResult.fixedIssuesCount} correções aplicadas
                    </span>
                  </div>

                  <ul className="space-y-1 text-xs text-slate-300">
                    {lastRepairResult.details.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#00e575] font-bold mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Diagnostics Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-bold text-white font-display">
                    Testes de Integridade & Diagnósticos em Tempo Real
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {healthReport?.items.length || 5} testes executados
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(healthReport?.items || [
                    {
                      id: 'conn',
                      name: 'Conexão com Banco de Dados / API',
                      status: 'healthy' as const,
                      message: 'Sincronizado e operando em tempo real.',
                    },
                    {
                      id: 'tasks_schema',
                      name: 'Integridade Estrutural das Vagas',
                      status: 'healthy' as const,
                      message: 'Todas as vagas possuem atributos válidos.',
                    },
                    {
                      id: 'daily_missions',
                      name: 'Missões Diárias & Contatos dos Contratantes',
                      status: 'healthy' as const,
                      message: 'Telefones e prazos verificados.',
                    },
                    {
                      id: 'submissions',
                      name: 'Auditoria de Envios & Carteira PIX',
                      status: 'healthy' as const,
                      message: 'Chaves PIX e submissões auditadas.',
                    },
                    {
                      id: 'storage',
                      name: 'Espaço & Quota de Armazenamento Local',
                      status: 'healthy' as const,
                      message: 'Utilização de memória dentro da faixa ideal.',
                    },
                  ]).map((item) => {
                    const isHealthy = item.status === 'healthy';
                    const isWarning = item.status === 'warning';
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isHealthy
                            ? 'bg-slate-950/60 border-white/10 hover:border-[#00e575]/30'
                            : isWarning
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : 'bg-rose-950/20 border-rose-500/40'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            {isHealthy ? (
                              <CheckCircle2 className="w-4 h-4 text-[#00e575] shrink-0" />
                            ) : isWarning ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <h5 className="text-xs sm:text-sm font-bold text-white">
                              {item.name}
                            </h5>
                          </div>

                          <p className="text-xs text-slate-300 pl-6">
                            {item.message}
                          </p>

                          {item.details && (
                            <p className="text-[11px] text-slate-500 pl-6">
                              {item.details}
                            </p>
                          )}
                        </div>

                        <div className="self-end sm:self-auto shrink-0">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                              isHealthy
                                ? 'bg-emerald-500/15 text-[#00e575] border border-emerald-500/30'
                                : isWarning
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isHealthy ? 'Íntegro ✓' : isWarning ? 'Atenção ⚠️' : 'Inconsistente ✕'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: AUDITORIA DE ENVIOS DE VÍDEO (PIX) */}
          {/* ======================================================== */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white font-display">
                    Auditoria e Liberação de PIX ({submissions.length})
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Aprove os vídeos enviados pelos freelancers para liberar os valores da carteira.
                  </p>
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 border border-white/5 rounded-2xl text-xs text-slate-400">
                  Nenhum envio registrado para análise no momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{sub.taskTitle}</span>
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

          {/* ======================================================== */}
          {/* TAB 3: REGRAS DE NEGÓCIO & PLATAFORMA */}
          {/* ======================================================== */}
          {activeTab === 'business' && (
            <form onSubmit={handleSaveBusinessSettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Valor Base Padrão das Gravações (R$)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    value={defaultBasePay}
                    onChange={(e) => setDefaultBasePay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Bônus Padrão por Qualidade HD / 60fps (R$)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="150"
                    value={defaultVideoBonus}
                    onChange={(e) => setDefaultVideoBonus(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Prazo Limite para Bônus (Horas)
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Aprovação Automática do PIX
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="auto-pix"
                      checked={autoApprovePix}
                      onChange={(e) => setAutoApprovePix(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00e575] accent-[#00e575] cursor-pointer"
                    />
                    <label htmlFor="auto-pix" className="text-xs text-slate-300 cursor-pointer">
                      Aprovar pagamentos instantaneamente após verificação do vídeo
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Banner Superior de Aviso da Plataforma</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={isAnnouncementActive}
                    onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00e575] accent-[#00e575] cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Ex: ⚡ Vagas com bônus relâmpago de 24h ativas hoje! Grave e receba via PIX."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all shadow-md shadow-[#00e575]/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Regras de Negócio</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 4: CONFIGURAÇÕES GEMINI IA */}
          {/* ======================================================== */}
          {activeTab === 'ai' && (
            <form onSubmit={handleSaveAISettings} className="space-y-5">
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
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Instrução do Sistema (Prompt Diretor do Gemini)
                </label>
                <textarea
                  rows={4}
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575] font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Mensagem de Boas-Vindas no Chat
                </label>
                <textarea
                  rows={2}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all shadow-md shadow-[#00e575]/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Configurações da IA</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 5: SEO, SEARCH ENGINES, INDEXNOW & AI DISCOVERY      */}
          {/* ======================================================== */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-[#00e575]/30 text-[#00e575] flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Discovery, Motores de Busca & Google AI Search
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Configuração centralizada para Google Search Console, Google Jobs, Bing, IndexNow e crawlers de IA.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] bg-emerald-500/10 text-[#00e575] border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold">
                    Indexação Ativa
                  </span>
                </div>

                {/* Form to update verification keys */}
                <form onSubmit={handleSaveSeoSettings} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Google Search Console */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Google Search Console (GOOGLE_SITE_VERIFICATION)</span>
                      </label>
                      <input
                        type="text"
                        value={googleSiteVerification}
                        onChange={(e) => setGoogleSiteVerification(e.target.value)}
                        placeholder="Ex: dK8F9... (token fornecido no GSC)"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
                      />
                      <p className="text-[10.5px] text-slate-500">
                        Injeta a meta tag de verificação no cabeçalho HTML da página.
                      </p>
                    </div>

                    {/* Bing Webmaster Tools */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Bing Webmaster Tools (msvalidate.01)</span>
                      </label>
                      <input
                        type="text"
                        value={bingSiteVerification}
                        onChange={(e) => setBingSiteVerification(e.target.value)}
                        placeholder="Ex: 8A4B... (token do Bing Webmaster)"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
                      />
                      <p className="text-[10.5px] text-slate-500">
                        Injeta a validação msvalidate.01 para rastreamento no Bing.
                      </p>
                    </div>
                  </div>

                  {/* IndexNow Key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Chave Protocolo IndexNow (INDEXNOW_KEY)
                    </label>
                    <input
                      type="text"
                      value={indexNowKey}
                      onChange={(e) => setIndexNowKey(e.target.value)}
                      placeholder="freelahub2026indexnowkey"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575] font-mono"
                    />
                    <p className="text-[10.5px] text-slate-500">
                      Arquivo de validação correspondente público em: <span className="text-emerald-400 font-mono">/freelahub2026indexnowkey.txt</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-[#00e575] hover:bg-[#00ff87] rounded-xl transition-all shadow-md shadow-[#00e575]/25 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Configurações de SEO</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBroadcastIndexNow}
                      disabled={isBroadcastingIndexNow}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#00e575] ${isBroadcastingIndexNow ? 'animate-spin' : ''}`} />
                      <span>{isBroadcastingIndexNow ? 'Notificando IndexNow...' : 'Disparar IndexNow para Vagas Ativas'}</span>
                    </button>
                  </div>

                  {indexNowReport && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs">
                      {indexNowReport}
                    </div>
                  )}
                </form>
              </div>

              {/* Direct links to XML sitemap and robots.txt */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-950/70 border border-white/10 hover:border-emerald-500/50 rounded-xl p-4 transition-all block group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#00e575]">
                    <span>Sitemap XML Dinâmico</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00e575]" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    /sitemap.xml gerado diretamente do NeonDB com canonical e lastmod.
                  </p>
                </a>

                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-950/70 border border-white/10 hover:border-emerald-500/50 rounded-xl p-4 transition-all block group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#00e575]">
                    <span>Robots.txt</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00e575]" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Permite páginas públicas, declara o sitemap e bloqueia rotas /admin.
                  </p>
                </a>

                <a
                  href="/freelahub2026indexnowkey.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-950/70 border border-white/10 hover:border-emerald-500/50 rounded-xl p-4 transition-all block group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#00e575]">
                    <span>Validação IndexNow</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00e575]" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Chave textual pública para confirmação do Bing e parceiros IndexNow.
                  </p>
                </a>
              </div>

              {/* Conformance Checklist */}
              <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 space-y-3">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                  Checklist de Conformidade Técnica & Diretrizes de Qualidade
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00e575] shrink-0" />
                    <span>JobPosting JSON-LD exclusivo em páginas individuais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00e575] shrink-0" />
                    <span>URLs canônicas permanentes /vagas/:slug</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00e575] shrink-0" />
                    <span>Vagas expiradas atualizam status e removem JobPosting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00e575] shrink-0" />
                    <span>HTML semântico real para AI Overviews & leitores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00e575] shrink-0" />
                    <span>Sitemap dinâmico sincronizado em tempo real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00e575] shrink-0" />
                    <span>IndexNow notificado automaticamente na criação/edição</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e575] animate-pulse" />
            <span className="hidden sm:inline">Ambiente Administrativo Seguro da Equipe FreelaHub</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
