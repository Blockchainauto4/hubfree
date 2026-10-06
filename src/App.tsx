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
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { INITIAL_TASKS } from './data/initialTasks';
import { DEFAULT_ASSISTANT_CONFIG, DEFAULT_PLATFORM_SETTINGS } from './data/defaultAdminConfig';
import { Task, WorkLocationType, VideoSubmission, AdminAssistantConfig, PlatformSettings } from './types';
import {
  seedInitialTasksIfEmpty,
  subscribeToTasks,
  saveTaskToDb,
  saveSubmissionToDb,
  saveUserToDb,
} from './services/dbService';

export default function App() {
  // Tasks state with localStorage persistence
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('freelashub_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  // Wallet and submissions state
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('freelashub_wallet_balance');
      if (saved) return Number(saved);
    } catch (e) {
      console.warn(e);
    }
    return 130.0; // Initial sample approved balance to explore
  });

  const [bonusAccumulated, setBonusAccumulated] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('freelashub_bonus_acc');
      if (saved) return Number(saved);
    } catch (e) {
      console.warn(e);
    }
    return 55.0;
  });

  const [submissions, setSubmissions] = useState<VideoSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('freelashub_submissions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'sub-sample-1',
        taskId: 'task-1',
        taskTitle: 'Montagem de Quadro de Distribuição Elétrica Trifásica',
        freelancerName: 'Carlos Silva',
        pixKey: 'carlos.eletrica@gmail.com',
        pixType: 'email',
        submittedAt: 'Hoje às 08:45',
        status: 'approved',
        baseEarned: 60,
        bonusEarned: 30,
        totalEarned: 90,
        videoFileName: 'painel_eletrico_pov_1080p.mp4',
        resolution: '1080p',
        fps: 60,
      },
      {
        id: 'sub-sample-2',
        taskId: 'task-4',
        taskTitle: 'Preparo e Sovagem de Pão Rústico',
        freelancerName: 'Carlos Silva',
        pixKey: 'carlos.eletrica@gmail.com',
        pixType: 'email',
        submittedAt: 'Hoje às 09:12',
        status: 'approved',
        baseEarned: 40,
        bonusEarned: 25,
        totalEarned: 65,
        videoFileName: 'pao_artesanal_pov_hd.mp4',
        resolution: '1080p',
        fps: 60,
      },
    ];
  });

  // Location filter state ('all' | 'workplace' | 'home')
  const [locationFilter, setLocationFilter] = useState<WorkLocationType>('all');

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

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
      localStorage.setItem('freelashub_tasks', JSON.stringify(tasks));
      localStorage.setItem('freelashub_wallet_balance', walletBalance.toString());
      localStorage.setItem('freelashub_bonus_acc', bonusAccumulated.toString());
      localStorage.setItem('freelashub_submissions', JSON.stringify(submissions));
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
    setTasks((prev) => [newTask, ...prev]);
    saveTaskToDb(newTask);
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

      {/* Navigation Header */}
      <Header
        onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenGemini={() => setIsGeminiOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        walletBalance={walletBalance}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section matching User's Screenshot */}
        <Hero
          locationFilter={locationFilter}
          onChangeLocation={(loc) => setLocationFilter(loc)}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          onExploreTasks={handleScrollToTasks}
        />

        {/* Daily Tasks Feed with Video Bonus highlights */}
        <DailyTasksFeed
          tasks={tasks}
          selectedLocation={locationFilter}
          onSelectLocation={(loc) => setLocationFilter(loc)}
          onSelectTask={(task) => setSelectedTask(task)}
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        />

        {/* Interactive Earnings Simulator */}
        <EarningsCalculator onExploreTasks={handleScrollToTasks} />

        {/* Starter Kit & Recording Setup */}
        <StarterKitSection />

        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenCreateTask={() => setIsCreateTaskOpen(true)}
      />

      {/* Floating WhatsApp Support matching user's screenshot button */}
      <WhatsAppSupportModal />

      {/* Interactive Modals */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSubmitSuccess={handleSubmissionSuccess}
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

      <GeminiAssistantModal
        isOpen={isGeminiOpen}
        onClose={() => setIsGeminiOpen(false)}
        config={assistantConfig}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        assistantConfig={assistantConfig}
        onSaveAssistantConfig={handleSaveAssistantConfig}
        platformSettings={platformSettings}
        onSavePlatformSettings={handleSavePlatformSettings}
        submissions={submissions}
        onApproveSubmission={(id) => {
          setSubmissions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s))
          );
        }}
      />
    </div>
  );
}
