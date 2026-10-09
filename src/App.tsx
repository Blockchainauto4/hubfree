/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DailyTasksFeed } from './components/DailyTasksFeed';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { EarningsCalculator } from './components/EarningsCalculator';
import { StarterKitSection } from './components/StarterKitSection';
import { HowItWorksModal } from './components/HowItWorksModal';
import { WalletModal } from './components/WalletModal';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { WhatsAppSupportModal } from './components/WhatsAppSupportModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AdminArea } from './components/AdminArea';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { FreelancerCategoriesPage } from './components/FreelancerCategoriesPage';
import { JobDetailPage } from './components/JobDetailPage';
import { CategoryLandingPage } from './components/CategoryLandingPage';
import { LegalPage } from './components/LegalPage';
import { TikTokMissionModal } from './components/TikTokMissionModal';
import {
  getTikTokAccessState,
  subscribeToTikTokAccess,
  formatRemainingTime,
} from './services/tiktokService';
import { getTaskCanonicalPath, extractTaskIdFromSlug, slugify } from './utils/slugify';
import { INITIAL_TASKS } from './data/initialTasks';
import { DEFAULT_ASSISTANT_CONFIG, DEFAULT_PLATFORM_SETTINGS } from './data/defaultAdminConfig';
import { Task, WorkLocationType, VideoSubmission, AdminAssistantConfig, PlatformSettings, TikTokAccessState } from './types';
import {
  seedInitialTasksIfEmpty,
  subscribeToTasks,
  saveTaskToDb,
  updateTaskInDb,
  deleteTaskFromDb,
  saveSubmissionToDb,
  saveUserToDb,
} from './services/dbService';

export default function App() {
  // Tasks state with localStorage persistence - strictly real vacancies
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('freelahub_tasks') || localStorage.getItem('freelashub_tasks');
      if (saved) {
        const parsed: Task[] = JSON.parse(saved);
        const hasMock = parsed.some(
          (t) =>
            t.id?.startsWith('task-1') ||
            t.id?.startsWith('task-2') ||
            t.id?.startsWith('task-home-') ||
            t.title?.toLowerCase().includes('quadro de distribuição') ||
            t.title?.toLowerCase().includes('pastilhas e sangria') ||
            t.title?.toLowerCase().includes('eletricista') ||
            t.title?.toLowerCase().includes('mecânico')
        );
        const hasRealTasks =
          parsed.some((t) => t.id === 'vaga-barman-vila-clementino-1010') &&
          parsed.some((t) => t.id === 'vaga-seguranca-jurubatuba-1010') &&
          parsed.some((t) => t.id === 'vaga-promotora-posto-graal-bandeirantes');

        if (!hasMock && hasRealTasks && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  // Wallet and submissions state (no demonstration data)
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('freelahub_wallet_balance') || localStorage.getItem('freelashub_wallet_balance');
      if (saved) return Number(saved);
    } catch (e) {
      console.warn(e);
    }
    return 0.0;
  });

  const [bonusAccumulated, setBonusAccumulated] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('freelahub_bonus_acc') || localStorage.getItem('freelashub_bonus_acc');
      if (saved) return Number(saved);
    } catch (e) {
      console.warn(e);
    }
    return 0.0;
  });

  const [submissions, setSubmissions] = useState<VideoSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('freelahub_submissions') || localStorage.getItem('freelashub_submissions');
      if (saved) {
        const parsed: VideoSubmission[] = JSON.parse(saved);
        const hasMock = parsed.some((s) => s.id === 'sub-sample-1' || s.freelancerName === 'Carlos Silva');
        if (!hasMock) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  // Location filter state ('all' | 'workplace' | 'home')
  const [locationFilter, setLocationFilter] = useState<WorkLocationType>('all');

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDailyMissionsOpen, setIsDailyMissionsOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [activeView, setActiveView] = useState<'categories' | 'video'>('categories');

  // TikTok 24-Hour Access & Cronômetro de Permanência de 2 Minutos
  const TWO_MINUTES_SECONDS = 120; // 2 minutos de permanência

  const getProjectEntryTimestamp = (): number => {
    if (typeof window === 'undefined') return Date.now();
    try {
      const stored = sessionStorage.getItem('freelahub_project_entry_timestamp');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      const now = Date.now();
      sessionStorage.setItem('freelahub_project_entry_timestamp', now.toString());
      return now;
    } catch {
      return Date.now();
    }
  };

  const calculatePermanenceSecondsLeft = (): number => {
    const current = getTikTokAccessState();
    if (current.isUnlocked) return 0;
    const entry = getProjectEntryTimestamp();
    const elapsedSec = Math.floor((Date.now() - entry) / 1000);
    return Math.max(0, TWO_MINUTES_SECONDS - elapsedSec);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(Math.max(0, totalSec) / 60);
    const secs = Math.max(0, totalSec) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [tiktokAccessState, setTiktokAccessState] = useState<TikTokAccessState>(() => getTikTokAccessState());
  const [permanenceSecondsLeft, setPermanenceSecondsLeft] = useState<number>(() => calculatePermanenceSecondsLeft());
  const [isTikTokModalOpen, setIsTikTokModalOpen] = useState<boolean>(() => {
    const current = getTikTokAccessState();
    if (current.isUnlocked) return false;
    // Se a pessoa já completou 2 minutos de permanência no projeto, bloqueia qualquer interação
    return calculatePermanenceSecondsLeft() <= 0;
  });
  const [tiktokModalSource, setTiktokModalSource] = useState<string>('permanence_timer');

  // Cronômetro que mede a permanência da pessoa quando entra no projeto
  useEffect(() => {
    // Se já estiver com passe de 24h ativo, não precisa bloquear
    if (tiktokAccessState.isUnlocked) {
      setPermanenceSecondsLeft(0);
      setIsTikTokModalOpen(false);
      return;
    }

    const checkPermanence = () => {
      const remaining = calculatePermanenceSecondsLeft();
      setPermanenceSecondsLeft(remaining);

      // Depois de dois minutos de permanência, mostra o pop-up e bloqueia qualquer interação
      if (remaining <= 0) {
        setIsTikTokModalOpen(true);
      }
    };

    checkPermanence();
    const interval = setInterval(checkPermanence, 1000);
    return () => clearInterval(interval);
  }, [tiktokAccessState.isUnlocked]);

  useEffect(() => {
    const unsubscribe = subscribeToTikTokAccess((newState) => {
      setTiktokAccessState(newState);
      if (!newState.isUnlocked) {
        const remaining = calculatePermanenceSecondsLeft();
        if (remaining <= 0) {
          setIsTikTokModalOpen(true);
        }
      } else {
        setIsTikTokModalOpen(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenTikTokMission = (source: string = 'button') => {
    setTiktokModalSource(source);
    setIsTikTokModalOpen(true);
  };

  // Client-side Router matching window.location.pathname
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Admin Assistant and Platform Configuration
  const [assistantConfig, setAssistantConfig] = useState<AdminAssistantConfig>(() => {
    try {
      const saved = localStorage.getItem('freelahub_assistant_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_ASSISTANT_CONFIG;
  });

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    try {
      const saved = localStorage.getItem('freelahub_platform_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_PLATFORM_SETTINGS;
  });

  const handleSaveAssistantConfig = (cfg: AdminAssistantConfig) => {
    setAssistantConfig(cfg);
    localStorage.setItem('freelahub_assistant_config', JSON.stringify(cfg));
  };

  const handleSavePlatformSettings = (st: PlatformSettings) => {
    setPlatformSettings(st);
    localStorage.setItem('freelahub_platform_settings', JSON.stringify(st));
  };
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: 'freelancer' | 'empresa';
    pixKey?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('freelahub_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return null;
  });

  const handleOpenAuth = (mode: 'register' | 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // Sync with Firestore and LocalStorage
  useEffect(() => {
    // Seed and subscribe to live database
    seedInitialTasksIfEmpty();
    const unsubscribe = subscribeToTasks((liveTasks) => {
      setTasks(liveTasks);
    });

    return () => unsubscribe();
  }, []);

  // Sync state to localStorage backup
  useEffect(() => {
    try {
      localStorage.setItem('freelahub_tasks', JSON.stringify(tasks));
      localStorage.setItem('freelahub_wallet_balance', walletBalance.toString());
      localStorage.setItem('freelahub_bonus_acc', bonusAccumulated.toString());
      localStorage.setItem('freelahub_submissions', JSON.stringify(submissions));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [tasks, walletBalance, bonusAccumulated, submissions]);

  // Handle new submission
  const handleSubmissionSuccess = (newSub: VideoSubmission) => {
    setSubmissions((prev) => [newSub, ...prev]);
    setWalletBalance((prev) => prev + newSub.totalEarned);
    setBonusAccumulated((prev) => prev + newSub.bonusEarned);

    // Save to Firestore
    saveSubmissionToDb(newSub);

    // Update task slots
    setTasks((prev) =>
      prev.map((t) =>
        t.id === newSub.taskId ? { ...t, slotsFilled: Math.min(t.slotsTotal, t.slotsFilled + 1) } : t
      )
    );
  };

  // Handle new task creation
  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id)]);
    saveTaskToDb(newTask);
  };

  // Handle task update
  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    updateTaskInDb(updatedTask);
  };

  // Handle task deletion
  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTaskFromDb(taskId);
  };

  // Handle user login/registration
  const handleUserLoggedIn = (user: { name: string; email: string; role: 'freelancer' | 'empresa'; pixKey?: string }) => {
    setCurrentUser(user);
    saveUserToDb({
      ...user,
      walletBalance,
    });
  };

  // Handle withdraw
  const handleWithdraw = (amount: number) => {
    setWalletBalance((prev) => Math.max(0, prev - amount));
  };

  const handleScrollToTasks = () => {
    const el = document.getElementById('vagas');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const dailyMissionsCount = tasks.filter(
    (t) => t.isDailyMission || (typeof t.expiresInHours === 'number' && t.expiresInHours <= 24)
  ).length;

  return (
    <div className="min-h-screen bg-[#0b0f12] text-slate-100 flex flex-col selection:bg-[#00e575]/30 selection:text-white">
      {/* Top Announcement Banner if activated by Admin */}
      {platformSettings.isAnnouncementActive && platformSettings.announcementBannerText && (
        <div className="w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-[#00e575]/30 px-4 py-2 text-center text-xs text-emerald-300 font-medium flex items-center justify-center gap-2">
          <span>{platformSettings.announcementBannerText}</span>
          <button
            type="button"
            onClick={() => handleSavePlatformSettings({ ...platformSettings, isAnnouncementActive: false })}
            className="text-slate-400 hover:text-white text-xs cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Banner do Cronômetro de Permanência (2 Minutos de navegação livre antes de bloquear) */}
      {!tiktokAccessState.isUnlocked && permanenceSecondsLeft > 0 && currentPath !== '/admin' && currentPath !== '/painel-admin' && !isAdminOpen && (
        <div className="w-full bg-gradient-to-r from-slate-950 via-amber-950/70 to-slate-950 border-b border-amber-500/30 px-3 sm:px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-2 shadow-sm z-30 sticky top-0 backdrop-blur-md">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="truncate">
              <strong>Cronômetro de Permanência:</strong> {formatTimer(permanenceSecondsLeft)} de navegação livre restante. Após 2 minutos, libere todos os números do contratante por 24 horas.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleOpenTikTokMission('permanence_banner')}
            className="shrink-0 px-3 py-1 rounded-lg bg-gradient-to-r from-[#fe2c55] to-rose-600 hover:opacity-90 text-white font-bold text-[11px] shadow-sm cursor-pointer transition-transform active:scale-95"
          >
            Liberar Contatos (24h)
          </button>
        </div>
      )}

      {/* Main Content Area resolved by Client-Side Route */}
      {(() => {
        // 0. Dedicated Admin Area with Password Gate (/admin ou /painel-admin)
        if (currentPath === '/admin' || currentPath === '/painel-admin' || isAdminOpen) {
          return (
            <AdminArea
              onBackToSite={() => {
                setIsAdminOpen(false);
                navigate('/');
              }}
              tasks={tasks}
              onTaskCreated={handleTaskCreated}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
              platformSettings={platformSettings}
              onSavePlatformSettings={handleSavePlatformSettings}
              submissions={submissions}
              onApproveSubmission={(id) => {
                setSubmissions((prev) =>
                  prev.map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s))
                );
              }}
            />
          );
        }

        // 1. Legal Pages
        if (currentPath === '/privacidade') {
          return <LegalPage type="privacidade" onBack={() => navigate('/')} />;
        }
        if (currentPath === '/termos') {
          return <LegalPage type="termos" onBack={() => navigate('/')} />;
        }

        // 2. Individual Job Page: /vagas/:slug
        if (currentPath.startsWith('/vagas/') && currentPath.length > 7) {
          const slug = currentPath.replace('/vagas/', '');
          const taskId = extractTaskIdFromSlug(slug);
          const matchedTask = tasks.find(
            (t) => t.id === taskId || getTaskCanonicalPath(t) === currentPath || slugify(t.title) === slug
          );

          if (matchedTask) {
            return (
              <JobDetailPage
                task={matchedTask}
                allTasks={tasks}
                onBack={() => navigate('/')}
                onNavigateToTask={(t) => navigate(getTaskCanonicalPath(t))}
                onNavigateToCategory={(cat) => navigate(`/categorias/${slugify(cat)}`)}
                onNavigateToCity={(city) => navigate(`/local/sp/${slugify(city)}`)}
                onOpenApplyModal={(t) => setSelectedTask(t)}
                isTikTokUnlocked={tiktokAccessState.isUnlocked}
                onOpenTikTokMission={() => handleOpenTikTokMission('job_detail')}
                remainingTimeText={formatRemainingTime(tiktokAccessState.remainingMs)}
              />
            );
          }

          // If job slug not found, show friendly discovery 404
          return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl font-bold">
                🔍
              </div>
              <h2 className="text-xl font-bold text-white">Vaga não encontrada ou expirada</h2>
              <p className="text-xs text-slate-400">
                Esta oportunidade pode ter atingido o limite de vagas ou expirado seu prazo de 24 horas.
              </p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-5 py-2.5 bg-[#00a859] hover:bg-[#00964f] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Ver Todas as Vagas Disponíveis
              </button>
            </div>
          );
        }

        // 3. Category Landing Page: /categorias/:slug
        if (currentPath.startsWith('/categorias/') && currentPath.length > 12) {
          const catSlug = currentPath.replace('/categorias/', '');
          const matched = tasks.find((t) => slugify(t.category) === catSlug);
          const categoryName = matched ? matched.category : catSlug;

          return (
            <CategoryLandingPage
              type="category"
              value={categoryName}
              tasks={tasks}
              onBack={() => navigate('/')}
              onSelectTask={(t) => navigate(getTaskCanonicalPath(t))}
              onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
            />
          );
        }

        // 4. City / Local Landing Page: /local/:estado/:cidade
        if (currentPath.startsWith('/local/') && currentPath.length > 7) {
          const parts = currentPath.split('/').filter(Boolean);
          const citySlug = parts[2] || parts[1] || '';
          const matched = tasks.find((t) => t.city && slugify(t.city) === citySlug);
          const cityName = matched?.city || 'São Paulo';

          return (
            <CategoryLandingPage
              type="city"
              value={cityName}
              tasks={tasks}
              onBack={() => navigate('/')}
              onSelectTask={(t) => navigate(getTaskCanonicalPath(t))}
              onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
            />
          );
        }

        // 5. Video POV Page (/video or activeView === 'video')
        if (currentPath === '/video' || activeView === 'video') {
          return (
            <>
              <Header
                onOpenCreateTask={() => setIsCreateTaskOpen(true)}
                onOpenWallet={() => setIsWalletOpen(true)}
                onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
                onOpenAuth={handleOpenAuth}
                onOpenAdmin={() => navigate('/admin')}
                onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
                onNavigateToCategories={() => {
                  setActiveView('categories');
                  navigate('/');
                }}
                dailyMissionsCount={dailyMissionsCount}
                walletBalance={walletBalance}
                currentUser={currentUser}
              />

              <main className="flex-1">
                <DailyTasksFeed
                  tasks={tasks}
                  selectedLocation={locationFilter}
                  onSelectLocation={(loc) => setLocationFilter(loc)}
                  onSelectTask={(task) => setSelectedTask(task)}
                  onOpenCreateTask={() => setIsCreateTaskOpen(true)}
                  onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
                />

                <Hero
                  locationFilter={locationFilter}
                  onChangeLocation={(loc) => setLocationFilter(loc)}
                  onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
                  onExploreTasks={handleScrollToTasks}
                  onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
                />

                <EarningsCalculator onExploreTasks={handleScrollToTasks} />
                <StarterKitSection />
                <FAQSection />
              </main>

              <Footer
                onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
                onOpenCreateTask={() => setIsCreateTaskOpen(true)}
                onOpenPrivacy={() => navigate('/privacidade')}
                onOpenTerms={() => navigate('/termos')}
              />
            </>
          );
        }

        // 6. Default: Freelancer Categories Page (Hub no Topo)
        return (
          <FreelancerCategoriesPage
            tasks={tasks}
            onSelectTask={(task) => setSelectedTask(task)}
            onNavigateToJobDetail={(task) => navigate(getTaskCanonicalPath(task))}
            onNavigateToCategory={(cat) => navigate(`/categorias/${slugify(cat)}`)}
            onNavigateToCity={(city) => navigate(`/local/sp/${slugify(city)}`)}
            onOpenPrivacy={() => navigate('/privacidade')}
            onOpenTerms={() => navigate('/termos')}
            onOpenVideoPage={() => {
              setActiveView('video');
              navigate('/video');
            }}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
            onOpenWallet={() => setIsWalletOpen(true)}
            onOpenAuth={handleOpenAuth}
            onOpenAdmin={() => navigate('/admin')}
            currentUser={currentUser}
            walletBalance={walletBalance}
            isTikTokUnlocked={tiktokAccessState.isUnlocked}
            onOpenTikTokMission={() => handleOpenTikTokMission('feed')}
            tiktokRemainingTime={formatRemainingTime(tiktokAccessState.remainingMs)}
          />
        );
      })()}

      {/* Floating WhatsApp Support Widget (+55 11 99127-1914) visível na área pública */}
      {currentPath !== '/admin' && currentPath !== '/painel-admin' && (
        <WhatsAppSupportModal />
      )}

      {/* Interactive Modals */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSubmitSuccess={handleSubmissionSuccess}
        isTikTokUnlocked={tiktokAccessState.isUnlocked}
        onOpenTikTokMission={() => handleOpenTikTokMission('task_modal')}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onExploreTasks={handleScrollToTasks}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={walletBalance}
        bonusAccumulated={bonusAccumulated}
        submissions={submissions}
        onWithdraw={handleWithdraw}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onUserLoggedIn={handleUserLoggedIn}
      />

      <DailyMissionsModal
        isOpen={isDailyMissionsOpen}
        onClose={() => setIsDailyMissionsOpen(false)}
        tasks={tasks}
        onSelectTask={(task) => {
          setSelectedTask(task);
        }}
        isTikTokUnlocked={tiktokAccessState.isUnlocked}
        onOpenTikTokMission={() => handleOpenTikTokMission('daily_missions')}
      />

      {/* TikTok Wheel Mission & 24h Unlock Pop-up (Bloqueio após 2 minutos de permanência na área pública) */}
      {currentPath !== '/admin' && currentPath !== '/painel-admin' && (
        <TikTokMissionModal
          isOpen={isTikTokModalOpen}
          onClose={() => {
            // Só permite fechar quando o acesso estiver liberado
            if (tiktokAccessState.isUnlocked) {
              setIsTikTokModalOpen(false);
            }
          }}
          accessState={tiktokAccessState}
          onUnlocked={(newState) => {
            setTiktokAccessState(newState);
            setIsTikTokModalOpen(false);
          }}
          customMissionUrl={platformSettings.tiktokMissionUrl}
          sourceContext={tiktokModalSource}
          permanenceSecondsLeft={permanenceSecondsLeft}
        />
      )}
    </div>
  );
}
