/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Área Administrativa Separada do FreelaHub com Autenticação por Senha
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Sliders,
  Database,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Search,
  ExternalLink,
  Save,
  RotateCcw,
  RefreshCw,
  Download,
  UploadCloud,
  Layers,
  Phone,
  User,
  Building2,
  DollarSign,
  Clock,
  Sparkles,
  Gift,
  FileCheck,
  Check,
  LogOut,
  Zap,
  Globe,
  Flame,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, PlatformSettings, VideoSubmission } from '../types';
import {
  isAdminAuthenticated,
  authenticateAdmin,
  logoutAdmin,
  changeAdminPassword,
  getAdminPassword,
  inspectDatabaseTables,
  runDeepIntegrityAudit,
  TableInfo,
  DatabaseIntegrityCheckResult
} from '../services/adminService';
import {
  repairDatabaseInconsistencies,
  exportDatabaseBackup,
  importDatabaseBackup,
  DatabaseRepairResult
} from '../services/dbService';
import { notifyIndexNow } from '../services/indexNowService';
import {
  unlockTikTokAccess,
  resetTikTokAccess,
  getTikTokAccessState,
  formatRemainingTime
} from '../services/tiktokService';
import { getTaskCanonicalPath } from '../utils/slugify';

interface AdminAreaProps {
  onBackToSite: () => void;
  tasks: Task[];
  onTaskCreated: (task: Task) => void;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  platformSettings: PlatformSettings;
  onSavePlatformSettings: (settings: PlatformSettings) => void;
  submissions: VideoSubmission[];
  onApproveSubmission?: (id: string) => void;
}

export const AdminArea: React.FC<AdminAreaProps> = ({
  onBackToSite,
  tasks,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  platformSettings,
  onSavePlatformSettings,
  submissions,
  onApproveSubmission,
}) => {
  // Autenticação de Administrador
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminAuthenticated());
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tabs do Painel: 'postings' | 'tables' | 'integrity' | 'essentials'
  const [activeTab, setActiveTab] = useState<'postings' | 'tables' | 'integrity' | 'essentials'>('postings');

  // Notificações Toast
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Tabelas do Banco de Dados
  const [tablesList, setTablesList] = useState<TableInfo[]>([]);
  const [selectedTableIndex, setSelectedTableIndex] = useState(0);
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [inspectedRowJson, setInspectedRowJson] = useState<any | null>(null);

  // Integridade do Banco de Dados
  const [integrityAudit, setIntegrityAudit] = useState<DatabaseIntegrityCheckResult | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [lastRepair, setLastRepair] = useState<DatabaseRepairResult | null>(null);
  const [backupJsonText, setBackupJsonText] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Formulário de Postagem / Edição de Vagas
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('Central de Eventos FreelaHub');
  const [formCategory, setFormCategory] = useState<Task['category']>('Eventos');
  const [formLocationType, setFormLocationType] = useState<'workplace' | 'home'>('workplace');
  const [formBasePay, setFormBasePay] = useState<number>(180);
  const [formPayType, setFormPayType] = useState<Task['payType']>('diária');
  const [formDuration, setFormDuration] = useState<number>(480);
  const [formSlotsTotal, setFormSlotsTotal] = useState<number>(5);
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80');
  const [formDescription, setFormDescription] = useState('');
  const [formRequirements, setFormRequirements] = useState<string[]>([
    'Pontualidade e apresentação adequada para o serviço',
    'Disponibilidade no local e horário combinado',
  ]);
  const [newRequirementText, setNewRequirementText] = useState('');
  const [formEquipment, setFormEquipment] = useState<string[]>(['Celular com WhatsApp para contato']);
  const [newEquipmentText, setNewEquipmentText] = useState('');
  const [formContractorPhone, setFormContractorPhone] = useState('11991271914');
  const [formContractorWhatsapp, setFormContractorWhatsapp] = useState('5511991271914');
  const [formContractorName, setFormContractorName] = useState('Coordenação FreelaHub');
  const [formCity, setFormCity] = useState('São Paulo');
  const [formNeighborhood, setFormNeighborhood] = useState('Vila Clementino');
  const [formIsUrgent, setFormIsUrgent] = useState(false);
  const [formIsDailyMission, setFormIsDailyMission] = useState(true);
  const [formHasActiveBonus, setFormHasActiveBonus] = useState(true);
  const [formVideoBonus, setFormVideoBonus] = useState<number>(50);

  // Aba Essenciais: Alterar Senha
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');

  // TikTok Controls
  const [tiktokUrlInput, setTiktokUrlInput] = useState(platformSettings.tiktokMissionUrl);
  const [currentTikTokAccess, setCurrentTikTokAccess] = useState(getTikTokAccessState());

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00e575', '#ffffff', '#38bdf8', '#fbbf24'],
      });
    } catch {}
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  // Carrega tabelas e auditoria ao autenticar
  useEffect(() => {
    if (isAuthenticated) {
      loadTables();
      executeAudit();
    }
  }, [isAuthenticated, tasks]);

  const loadTables = () => {
    const list = inspectDatabaseTables();
    setTablesList(list);
  };

  const executeAudit = async () => {
    setIsRunningAudit(true);
    const result = await runDeepIntegrityAudit();
    setIntegrityAudit(result);
    setIsRunningAudit(false);
  };

  // Login de Administrador
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const valid = authenticateAdmin(passwordInput.trim());
    if (valid) {
      setIsAuthenticated(true);
      setPasswordInput('');
      showSuccess('Administrador autenticado com sucesso!');
    } else {
      setAuthError('Senha de administrador incorreta. Tente novamente.');
    }
  };

  // Logout de Administrador
  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Alterar Senha
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPassword.length < 4) {
      alert('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      alert('As senhas não conferem. Digite novamente.');
      return;
    }

    const ok = changeAdminPassword(newAdminPassword);
    if (ok) {
      showSuccess('Senha de administrador alterada com sucesso!');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      executeAudit();
    } else {
      alert('Falha ao atualizar senha.');
    }
  };

  // Submissão do Formulário de Vagas (Criar ou Editar)
  const handleSubmitTaskForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      alert('Por favor, informe o título da vaga.');
      return;
    }

    const taskToSave: Task = {
      id: editingTaskId || `vaga-${Date.now().toString().slice(-6)}`,
      title: formTitle.trim(),
      company: formCompany.trim() || 'Central de Eventos FreelaHub',
      category: formCategory,
      locationType: formLocationType,
      basePay: Number(formBasePay) || 150,
      payType: formPayType,
      videoBonus: Number(formVideoBonus) || 0,
      bonusCondition: 'Grave tarefas em primeira pessoa (POV) com celular na vertical',
      hasActiveBonus: formHasActiveBonus,
      slotsTotal: Number(formSlotsTotal) || 5,
      slotsFilled: 0,
      durationMinutes: Number(formDuration) || 480,
      image: formImage || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
      description: formDescription.trim() || `Oportunidade para atuar como ${formTitle} com diária garantida no FreelaHub.`,
      requirements: formRequirements,
      equipmentNeeded: formEquipment,
      postedDate: 'Hoje',
      isUrgent: formIsUrgent,
      isDailyMission: formIsDailyMission,
      expiresInHours: 24,
      contractorPhone: formContractorPhone.trim(),
      contractorWhatsapp: formContractorWhatsapp.trim(),
      contractorContactName: formContractorName.trim(),
      city: formCity.trim(),
      neighborhood: formNeighborhood.trim(),
      state: 'SP',
    };

    if (editingTaskId) {
      onTaskUpdated(taskToSave);
      showSuccess(`Vaga "${taskToSave.title}" atualizada com sucesso!`);
    } else {
      onTaskCreated(taskToSave);
      showSuccess(`Nova vaga "${taskToSave.title}" publicada com sucesso em tempo real!`);
    }

    // Notifica IndexNow
    notifyIndexNow([getTaskCanonicalPath(taskToSave)]).catch(() => {});

    // Limpa formulário
    resetTaskForm();
    loadTables();
  };

  const resetTaskForm = () => {
    setEditingTaskId(null);
    setFormTitle('');
    setFormCompany('Central de Eventos FreelaHub');
    setFormCategory('Eventos');
    setFormLocationType('workplace');
    setFormBasePay(180);
    setFormPayType('diária');
    setFormDuration(480);
    setFormSlotsTotal(5);
    setFormDescription('');
    setFormCity('São Paulo');
    setFormNeighborhood('Vila Clementino');
    setFormContractorPhone('11991271914');
    setFormContractorWhatsapp('5511991271914');
    setFormContractorName('Coordenação FreelaHub');
    setFormIsUrgent(false);
    setFormIsDailyMission(true);
    setFormHasActiveBonus(true);
  };

  const handleEditTask = (t: Task) => {
    setEditingTaskId(t.id);
    setFormTitle(t.title);
    setFormCompany(t.company);
    setFormCategory(t.category);
    setFormLocationType(t.locationType);
    setFormBasePay(t.basePay);
    setFormPayType(t.payType);
    setFormDuration(t.durationMinutes);
    setFormSlotsTotal(t.slotsTotal);
    setFormImage(t.image);
    setFormDescription(t.description);
    setFormRequirements(t.requirements || []);
    setFormEquipment(t.equipmentNeeded || []);
    setFormContractorPhone(t.contractorPhone || '11991271914');
    setFormContractorWhatsapp(t.contractorWhatsapp || '5511991271914');
    setFormContractorName(t.contractorContactName || 'Coordenação FreelaHub');
    setFormCity(t.city || 'São Paulo');
    setFormNeighborhood(t.neighborhood || '');
    setFormIsUrgent(t.isUrgent || false);
    setFormIsDailyMission(t.isDailyMission || false);
    setFormHasActiveBonus(t.hasActiveBonus ?? true);
    setFormVideoBonus(t.videoBonus || 50);

    // Rola para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto Reparo de Integridade
  const handleRunRepair = async () => {
    setIsRepairing(true);
    await new Promise((r) => setTimeout(r, 600));
    const res = await repairDatabaseInconsistencies();
    setLastRepair(res);
    await executeAudit();
    loadTables();
    setIsRepairing(false);
    showSuccess(`Auto-Reparo de integridade concluído! ${res.fixedIssuesCount} correções aplicadas.`);
  };

  // Exportar Backup
  const handleExportBackup = () => {
    const json = exportDatabaseBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freelahub_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Backup completo do banco de dados exportado com sucesso (.json)!');
  };

  // Importar Backup
  const handleImportBackup = () => {
    if (!backupJsonText.trim()) {
      alert('Cole o conteúdo JSON válido para importação.');
      return;
    }
    const res = importDatabaseBackup(backupJsonText);
    if (res.success) {
      showSuccess(res.message);
      setBackupJsonText('');
      setShowImportDialog(false);
      loadTables();
      executeAudit();
    } else {
      alert(res.message);
    }
  };

  // Tabela selecionada
  const activeTable = tablesList[selectedTableIndex] || tablesList[0];
  const filteredTableData = (activeTable?.data || []).filter((row) => {
    if (!tableSearchQuery.trim()) return true;
    const str = JSON.stringify(row).toLowerCase();
    return str.includes(tableSearchQuery.toLowerCase());
  });

  // =========================================================================
  // TELA DE LOGIN / BLOQUEIO POR SENHA DE ADMINISTRADOR
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b0e] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
        {/* Iluminação de fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00e575]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md bg-slate-900/90 border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00e575]/15 border border-[#00e575]/30 text-[#00e575] flex items-center justify-center shadow-lg shadow-[#00e575]/20">
              <Lock className="w-8 h-8" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[11px] font-bold uppercase tracking-wider">
              Área Restrita da Equipe
            </span>
            <h1 className="text-2xl font-black text-white font-display">
              Administração FreelaHub
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Digite a senha de administrador para publicar vagas, checar as tabelas e verificar a integridade do banco de dados.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Senha de Administrador</span>
                <span className="text-[10px] text-slate-500 font-normal">Mestre do Sistema</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  autoFocus
                  placeholder="Digite a senha de administrador..."
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575] pr-11 font-mono tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#00e575] hover:bg-[#00ff87] text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00e575]/25 transition-all active:scale-98"
            >
              <KeyRound className="w-4 h-4" />
              <span>Acessar Painel Administrativo</span>
            </button>
          </form>

          {/* Dica da senha inicial para facilidade */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-[#00e575] shrink-0 mt-0.5" />
            <p>
              <strong>Dica de Acesso:</strong> A senha padrão inicial do sistema é <code className="text-[#00e575] bg-black/40 px-1 py-0.5 rounded font-mono font-bold">admin123</code>. Você pode alterá-la para qualquer outra senha dentro do painel.
            </p>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onBackToSite}
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Site Inicial</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAINEL ADMINISTRATIVO AUTENTICADO
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#070b0e] text-slate-100 flex flex-col">
      {/* Toast de Sucesso */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#00a859] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header do Painel */}
      <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-white/10 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToSite}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Voltar para a página pública"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao Site</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00e575] animate-pulse" />
              <h1 className="text-sm sm:text-base font-black text-white font-display">
                Área Administrativa FreelaHub
              </h1>
              <span className="hidden md:inline px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                Acesso Seguro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Publicação de vagas, checagem das tabelas do banco e auditoria de integridade
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status do Banco */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
            <Database className="w-3.5 h-3.5 text-[#00e575]" />
            <span className="text-slate-300 font-mono text-[11px]">{tasks.length} vagas ativas</span>
          </div>

          {/* Botão de Bloquear / Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Bloquear painel e exigir senha novamente"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Bloquear Painel</span>
          </button>
        </div>
      </header>

      {/* Navegação Principal por Abas */}
      <nav className="bg-slate-900 border-b border-white/10 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto text-xs sm:text-sm font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('postings')}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'postings'
              ? 'border-[#00e575] text-[#00e575]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Publicação de Vagas</span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full font-mono text-slate-300">
            {tasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('tables');
            loadTables();
          }}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'tables'
              ? 'border-[#00e575] text-[#00e575]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Checar Tabelas do Banco</span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full font-mono text-slate-300">
            6
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('integrity');
            executeAudit();
          }}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'integrity'
              ? 'border-[#00e575] text-[#00e575]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Integridade do Banco</span>
          {integrityAudit && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                integrityAudit.score >= 80 ? 'bg-emerald-500/20 text-[#00e575]' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {integrityAudit.score}%
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('essentials')}
          className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'essentials'
              ? 'border-[#00e575] text-[#00e575]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Outras Coisas Essenciais</span>
        </button>
      </nav>

      {/* Conteúdo Principal da Aba Ativa */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* ABA 1: PUBLICAÇÃO E GESTÃO DAS VAGAS */}
        {/* ========================================================================= */}
        {activeTab === 'postings' && (
          <div className="space-y-6">
            {/* Banner Informativo */}
            <div className="bg-gradient-to-r from-slate-950 via-[#111923] to-slate-950 border border-white/10 rounded-2xl p-5 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs font-bold text-[#00e575] uppercase tracking-wider block">
                  Central de Oportunidades
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {editingTaskId ? `Editar Vaga: ${formTitle}` : 'Publicar Nova Vaga no FreelaHub'}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  As vagas cadastradas aqui entram em tempo real no feed e ficam visíveis imediatamente para todos os freelancers. Os botões de WhatsApp e ligações com o contratante são liberados após a missão do TikTok.
                </p>
              </div>

              {editingTaskId && (
                <button
                  type="button"
                  onClick={resetTaskForm}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            {/* Formulário de Criação / Edição */}
            <form onSubmit={handleSubmitTaskForm} className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Título da Vaga */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-200">
                    Título da Vaga <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Barman para Evento Noturno • Vila Clementino"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                {/* Empresa / Contratante */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Empresa Contratante
                  </label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Ex: Grupo Gastronômico SP"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Categoria Profissional
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  >
                    <option value="Eventos">Eventos</option>
                    <option value="Gastronomia">Gastronomia</option>
                    <option value="Logística">Logística & Entregas</option>
                    <option value="Tecnologia">Tecnologia & TI</option>
                    <option value="Marketing">Marketing & Mídias</option>
                    <option value="Serviços Gerais">Serviços Gerais & Apoio</option>
                  </select>
                </div>

                {/* Remuneração Base */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Remuneração Base (R$)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    required
                    value={formBasePay}
                    onChange={(e) => setFormBasePay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                {/* Tipo de Pagamento */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Tipo de Pagamento
                  </label>
                  <select
                    value={formPayType}
                    onChange={(e) => setFormPayType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  >
                    <option value="diária">Por Diária</option>
                    <option value="hora">Por Hora</option>
                    <option value="vídeo">Por Tarefa / Vídeo</option>
                  </select>
                </div>

                {/* Vagas Disponíveis */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Total de Vagas Abertas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formSlotsTotal}
                    onChange={(e) => setFormSlotsTotal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                {/* Duração em Minutos */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Duração Estimada (minutos)
                  </label>
                  <input
                    type="number"
                    min="30"
                    step="30"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                {/* Localização Presencial ou Remota */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Modalidade de Trabalho
                  </label>
                  <select
                    value={formLocationType}
                    onChange={(e) => setFormLocationType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  >
                    <option value="workplace">Presencial (No Local)</option>
                    <option value="home">Home Office (Remoto)</option>
                  </select>
                </div>

                {/* Telefone Direto do Contratante */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Telefone do Contratante (DDD + Número)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formContractorPhone}
                    onChange={(e) => setFormContractorPhone(e.target.value)}
                    placeholder="11991271914"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                {/* WhatsApp Oficial do Contratante */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp Contratante (com DDI 55)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formContractorWhatsapp}
                    onChange={(e) => setFormContractorWhatsapp(e.target.value)}
                    placeholder="5511991271914"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                {/* Nome do Contratante */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Nome do Contratante / Responsável
                  </label>
                  <input
                    type="text"
                    value={formContractorName}
                    onChange={(e) => setFormContractorName(e.target.value)}
                    placeholder="Ex: Coordenação FreelaHub"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                {/* Cidade e Bairro */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Bairro / Região
                  </label>
                  <input
                    type="text"
                    value={formNeighborhood}
                    onChange={(e) => setFormNeighborhood(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>

                {/* Imagem de Capa */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-200">
                    URL da Imagem da Vaga
                  </label>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  Descrição Completa das Atividades
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descreva as tarefas, horário exato, vestimenta e orientações para o candidato..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575] leading-relaxed"
                />
              </div>

              {/* Checkboxes de Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsDailyMission}
                    onChange={(e) => setFormIsDailyMission(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#00e575]"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Missão Diária (24h)</span>
                    <span className="text-[10px] text-slate-400">Exige rotação e desbloqueio</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsUrgent}
                    onChange={(e) => setFormIsUrgent(e.target.checked)}
                    className="w-4 h-4 rounded accent-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Vaga Urgente</span>
                    <span className="text-[10px] text-slate-400">Destaque imediato com badge</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHasActiveBonus}
                    onChange={(e) => setFormHasActiveBonus(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#00e575]"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Bônus em Vídeo POV</span>
                    <span className="text-[10px] text-slate-400">+R$ {formVideoBonus} via PIX</span>
                  </div>
                </label>
              </div>

              {/* Botão de Salvar */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={resetTaskForm}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Limpar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00e575] hover:bg-[#00ff87] text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#00e575]/25 cursor-pointer transition-all active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTaskId ? 'Salvar Alterações da Vaga' : 'Publicar Vaga no Banco de Dados'}</span>
                </button>
              </div>
            </form>

            {/* Lista das Vagas Ativas no Banco */}
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#00e575]" />
                    <span>Vagas Publicadas no Banco de Dados ({tasks.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Gerencie, edite ou exclua qualquer vaga do sistema.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={taskSearchQuery}
                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                    placeholder="Buscar vaga por título..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e575]"
                  />
                </div>
              </div>

              {/* Grid de Cards de Vagas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tasks
                  .filter((t) => t.title.toLowerCase().includes(taskSearchQuery.toLowerCase()))
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold text-[#00e575] bg-[#00e575]/10 px-2 py-0.5 rounded">
                            {task.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            R$ {task.basePay}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {task.title}
                        </h4>
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <p className="truncate">🏢 {task.company}</p>
                          <p>📍 {task.city || 'São Paulo'} - {task.neighborhood || 'SP'}</p>
                          <p className="font-mono text-emerald-400">
                            📞 {task.contractorPhone || 'Sem telefone'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {task.id.slice(0, 14)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditTask(task)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                            title="Editar esta vaga"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja excluir a vaga "${task.title}"?`)) {
                                onTaskDeleted(task.id);
                                showSuccess(`Vaga "${task.title}" excluída com sucesso.`);
                                loadTables();
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs cursor-pointer"
                            title="Excluir esta vaga"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: CHECAR AS TABELAS DO BANCO DE DADOS */}
        {/* ========================================================================= */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-950 via-[#131b26] to-slate-950 border border-white/10 rounded-2xl p-5 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs font-bold text-[#00e575] uppercase tracking-wider block">
                  Explorador de Dados
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Tabelas Nativas do Banco de Dados
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Inspecione os esquemas relacionais, colunas, tipos de dados e os registros vivos salvos em cada tabela do sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={loadTables}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Atualizar Tabelas</span>
              </button>
            </div>

            {/* Seletor de Tabelas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {tablesList.map((t, idx) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    setSelectedTableIndex(idx);
                    setTableSearchQuery('');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedTableIndex === idx
                      ? 'bg-slate-900 border-[#00e575] text-white shadow-lg shadow-[#00e575]/10'
                      : 'bg-slate-950/70 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white block">
                      {t.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#00e575]">
                      {t.rowCount}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1">
                    {t.description}
                  </span>
                </button>
              ))}
            </div>

            {activeTable && (
              <div className="space-y-6">
                {/* Metadados da Tabela Selecionada */}
                <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[#00e575] text-xs font-mono font-bold">
                          TABLE: {activeTable.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({activeTable.rowCount} linhas encontradas)
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {activeTable.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const json = JSON.stringify(activeTable.data, null, 2);
                          const blob = new Blob([json], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `tabela_${activeTable.name}_${Date.now()}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Schema das Colunas */}
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950">
                    <div className="px-4 py-2.5 bg-slate-900/80 border-b border-white/10 text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span>Estrutura de Colunas (Esquema DDL)</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {activeTable.columns.length} colunas definidas
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900/50 text-slate-400 text-[11px] border-b border-white/10">
                          <tr>
                            <th className="py-2 px-3">Coluna</th>
                            <th className="py-2 px-3">Tipo de Dado</th>
                            <th className="py-2 px-3">Chave Primária</th>
                            <th className="py-2 px-3">Nulo Permitido</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {activeTable.columns.map((col) => (
                            <tr key={col.name} className="hover:bg-white/5">
                              <td className="py-2 px-3 font-bold text-white">{col.name}</td>
                              <td className="py-2 px-3 text-emerald-400">{col.type}</td>
                              <td className="py-2 px-3">
                                {col.primaryKey ? (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                    PRIMARY KEY (PK)
                                  </span>
                                ) : (
                                  <span className="text-slate-600">-</span>
                                )}
                              </td>
                              <td className="py-2 px-3">
                                {col.nullable ? (
                                  <span className="text-slate-400">SIM</span>
                                ) : (
                                  <span className="text-rose-400 font-bold">NÃO (NOT NULL)</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Visualizador de Registros Vivos */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-xs font-bold text-white">
                        Registros Armazenados ({filteredTableData.length})
                      </span>
                      <div className="relative w-full sm:w-60">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={tableSearchQuery}
                          onChange={(e) => setTableSearchQuery(e.target.value)}
                          placeholder="Filtrar dados da tabela..."
                          className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e575]"
                        />
                      </div>
                    </div>

                    <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950 max-h-96 overflow-y-auto">
                      {filteredTableData.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                          Nenhum registro encontrado nesta tabela.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-slate-900 text-slate-400 text-[11px] border-b border-white/10 sticky top-0">
                              <tr>
                                <th className="py-2.5 px-3">#</th>
                                {activeTable.columns.slice(0, 5).map((c) => (
                                  <th key={c.name} className="py-2.5 px-3">
                                    {c.name}
                                  </th>
                                ))}
                                <th className="py-2.5 px-3 text-right">Ação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-300">
                              {filteredTableData.map((row: any, idx: number) => (
                                <tr key={row.id || idx} className="hover:bg-white/5">
                                  <td className="py-2 px-3 text-slate-500 text-[10px]">{idx + 1}</td>
                                  {activeTable.columns.slice(0, 5).map((c) => (
                                    <td key={c.name} className="py-2 px-3 truncate max-w-[180px]">
                                      {typeof row[c.name] === 'object'
                                        ? JSON.stringify(row[c.name])
                                        : String(row[c.name] ?? '-')}
                                    </td>
                                  ))}
                                  <td className="py-2 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => setInspectedRowJson(row)}
                                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold cursor-pointer"
                                    >
                                      Ver JSON
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Inspector JSON */}
                {inspectedRowJson && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Database className="w-4 h-4 text-[#00e575]" />
                          <span>Inspeção de Registro JSON</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setInspectedRowJson(null)}
                          className="text-slate-400 hover:text-white text-xs font-bold p-1"
                        >
                          ✕
                        </button>
                      </div>

                      <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-emerald-300 overflow-x-auto max-h-80 leading-relaxed">
                        {JSON.stringify(inspectedRowJson, null, 2)}
                      </pre>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setInspectedRowJson(null)}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold cursor-pointer"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: VERIFICAR A INTEGRIDADE DO BANCO DE DADOS */}
        {/* ========================================================================= */}
        {activeTab === 'integrity' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-950 via-[#1a1426] to-slate-950 border border-white/10 rounded-2xl p-5 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                  Auditoria & Manutenção
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Diagnóstico e Integridade do Banco de Dados
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Avalia a consistência de chaves estrangeiras, telefones dos contratantes, integridade das 6 tabelas, dados órfãos e saúde da conexão com o banco.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={executeAudit}
                  disabled={isRunningAudit}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/30 transition-all active:scale-98"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunningAudit ? 'animate-spin' : ''}`} />
                  <span>{isRunningAudit ? 'Auditando...' : 'Executar Diagnóstico Completo'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunRepair}
                  disabled={isRepairing}
                  className="px-4 py-2.5 rounded-xl bg-[#00e575] hover:bg-[#00ff87] text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-[#00e575]/25 transition-all active:scale-98"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isRepairing ? 'Reparando...' : 'Auto-Reparo de Inconsistências'}</span>
                </button>
              </div>
            </div>

            {/* Score e Métricas de Integridade */}
            {integrityAudit && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-white/15 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Índice de Saúde Global
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-black font-mono ${
                        integrityAudit.score >= 80 ? 'text-[#00e575]' : 'text-amber-400'
                      }`}
                    >
                      {integrityAudit.score}%
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      {integrityAudit.overallStatus === 'healthy' ? 'Excelente' : 'Requer Atenção'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        integrityAudit.score >= 80 ? 'bg-[#00e575]' : 'bg-amber-400'
                      }`}
                      style={{ width: `${integrityAudit.score}%` }}
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-white/15 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Latência do Driver
                  </span>
                  <div className="text-3xl font-black font-mono text-white">
                    {integrityAudit.pingMs} ms
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Tempo de resposta atômico
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-white/15 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Última Verificação
                  </span>
                  <div className="text-3xl font-black font-mono text-white">
                    {integrityAudit.checkedAt}
                  </div>
                  <span className="text-[11px] text-emerald-400 block font-semibold">
                    Auditoria em tempo real
                  </span>
                </div>
              </div>
            )}

            {/* Testes Detalhados da Auditoria */}
            {integrityAudit && (
              <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00e575]" />
                  <span>Checklist de Verificações de Integridade</span>
                </h3>

                <div className="space-y-2">
                  {integrityAudit.checks.map((check) => (
                    <div
                      key={check.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-white/5 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        {check.status === 'healthy' ? (
                          <CheckCircle2 className="w-5 h-5 text-[#00e575] shrink-0 mt-0.5" />
                        ) : check.status === 'warning' ? (
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {check.name}
                          </span>
                          <span className="text-xs text-slate-300 mt-0.5 block leading-relaxed">
                            {check.message}
                          </span>
                          {check.details && (
                            <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                              {check.details}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                          check.status === 'healthy'
                            ? 'bg-emerald-500/20 text-[#00e575]'
                            : check.status === 'warning'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {check.status === 'healthy' ? 'Aprovado' : check.status === 'warning' ? 'Alerta' : 'Falha'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Backups e Restauração */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#00e575]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Backup Completo em JSON
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Exporta todas as vagas, envios, usuários e configurações do sistema em um único arquivo de segurança.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Arquivo de Backup</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Restauração de Dados
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Restaure o banco de dados colando um arquivo JSON exportado anteriormente pelo sistema.
                </p>
                <button
                  type="button"
                  onClick={() => setShowImportDialog(true)}
                  className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Restaurar Backup</span>
                </button>
              </div>
            </div>

            {/* Modal de Restauração */}
            {showImportDialog && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-purple-400" />
                      <span>Restaurar Banco de Dados</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowImportDialog(false)}
                      className="text-slate-400 hover:text-white text-xs font-bold p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Cole o conteúdo JSON do backup abaixo para restaurar as vagas e configurações no banco:
                  </p>

                  <textarea
                    rows={6}
                    value={backupJsonText}
                    onChange={(e) => setBackupJsonText(e.target.value)}
                    placeholder='{"tasks": [...], "timestamp": ...}'
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowImportDialog(false)}
                      className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleImportBackup}
                      className="px-5 py-2 rounded-xl bg-[#00e575] text-slate-950 font-black text-xs cursor-pointer"
                    >
                      Executar Restauração
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: OUTRAS COISAS ESSENCIAIS PARA O BOM FUNCIONAMENTO */}
        {/* ========================================================================= */}
        {activeTab === 'essentials' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-950 via-[#151c24] to-slate-950 border border-white/10 rounded-2xl p-5 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Controles Centrais
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Configurações Essenciais do Sistema
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Gerenciamento da senha mestra de administrador, parâmetros de desbloqueio do TikTok (2 minutos / 24h), canal oficial do WhatsApp e aprovações financeiras.
                </p>
              </div>
            </div>

            {/* 1. Alterar Senha de Administrador */}
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Alterar Senha do Administrador</h3>
                  <p className="text-xs text-slate-400">
                    Defina uma nova senha para proteger o acesso a esta área administrativa.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3 max-w-md pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Confirme a Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="Repita a nova senha..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00e575] font-mono"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#00e575] hover:bg-[#00ff87] text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#00e575]/25"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Nova Senha</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Parâmetros da Missão TikTok (Acesso 24h & Regra dos 2 Minutos) */}
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#fe2c55]/15 border border-[#fe2c55]/30 text-[#fe2c55] flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Missão TikTok & Ciclo de 24 Horas</h3>
                    <p className="text-xs text-slate-400">
                      Regra: Pop-up bloqueante aos 2 minutos de permanência. Passe de 24h para contatos.
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Status do Meu Acesso</span>
                  <span className={`font-bold ${currentTikTokAccess.isUnlocked ? 'text-[#00e575]' : 'text-amber-400'}`}>
                    {currentTikTokAccess.isUnlocked
                      ? `Liberado (${formatRemainingTime(currentTikTokAccess.remainingMs)})`
                      : 'Bloqueado (Aguardando Missão)'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Link Oficial da Roda no TikTok (Missão Premiada)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={tiktokUrlInput}
                    onChange={(e) => setTiktokUrlInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#fe2c55] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSavePlatformSettings({
                        ...platformSettings,
                        tiktokMissionUrl: tiktokUrlInput,
                      });
                      showSuccess('URL da missão TikTok atualizada com sucesso!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold cursor-pointer"
                  >
                    Salvar URL
                  </button>
                </div>
              </div>

              {/* Ações de Teste */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    const st = await unlockTikTokAccess('admin-test');
                    setCurrentTikTokAccess(st);
                    showSuccess('Passe de 24 horas ativado no seu navegador (Modo Teste)!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold cursor-pointer"
                >
                  Liberar 24h Agora (Teste)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetTikTokAccess();
                    setCurrentTikTokAccess(getTikTokAccessState());
                    showSuccess('Passe de 24 horas resetado com sucesso.');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold cursor-pointer"
                >
                  Resetar e Bloquear Acesso
                </button>
              </div>
            </div>

            {/* 3. Suporte Oficial WhatsApp */}
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Canal e Suporte Oficial do WhatsApp</h3>
                  <p className="text-xs text-slate-400">
                    Todas as dúvidas e perguntas dos candidatos são direcionadas para este canal oficial.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Número Oficial de Atendimento
                  </span>
                  <span className="text-sm font-mono font-bold text-[#25D366]">
                    +55 (11) 99127-1914
                  </span>
                </div>

                <a
                  href="https://wa.me/5511991271914?text=Ol%C3%A1!%20Teste%20do%20Painel%20Administrativo%20FreelaHub."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Testar Conversa no WhatsApp</span>
                </a>
              </div>
            </div>

            {/* 4. Aprovação de Envios & Saques PIX */}
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Moderação de Envios & Liberação de PIX</h3>
                  <p className="text-xs text-slate-400">
                    Aprove envios de freelancers para liberar o crédito em carteira.
                  </p>
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-white/5">
                  Nenhum envio pendente de moderação no momento.
                </div>
              ) : (
                <div className="space-y-2">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{sub.freelancerName}</span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            +R$ {sub.totalEarned.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Vaga: {sub.taskTitle} • PIX ({sub.pixType}): {sub.pixKey}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {sub.status === 'in_review' && onApproveSubmission && (
                          <button
                            type="button"
                            onClick={() => {
                              onApproveSubmission(sub.id);
                              showSuccess(`Envio de ${sub.freelancerName} aprovado!`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#00e575] text-slate-950 font-bold text-xs cursor-pointer"
                          >
                            Aprovar & Creditar PIX
                          </button>
                        )}
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {sub.status === 'approved' ? 'Aprovado' : sub.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Notificação aos Motores de Busca (SEO / IndexNow) */}
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Indexação de Novas Vagas (IndexNow / SEO)</h3>
                  <p className="text-xs text-slate-400">
                    Notifique o Bing e motores de busca para rastrear e indexar as vagas mais recentes.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    const paths = tasks.slice(0, 10).map((t) => getTaskCanonicalPath(t));
                    const res = await notifyIndexNow(paths);
                    showSuccess(`Notificação enviada ao IndexNow! Status: ${res.message}`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/30"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Notificar IndexNow para Vagas Atuais ({tasks.length})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
