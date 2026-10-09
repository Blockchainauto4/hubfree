export type WorkLocationType = 'all' | 'workplace' | 'home';

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  neighborhood?: string;
  accuracy?: number;
  permission: 'prompt' | 'granted' | 'denied';
}

export interface Task {
  id: string;
  slug?: string; // URL permanente canônica ex: /vagas/montagem-eletrica-sp-task-1
  title: string;
  company: string;
  locationType: 'workplace' | 'home';
  category: 'Mecânica' | 'Elétrica' | 'Culinária' | 'Tecnologia' | 'Construção' | 'Artesanato' | 'Serviços' | 'Manutenção e projetos da casa' | 'Serviços automotivos' | 'Eventos' | 'Segurança' | string;
  basePay: number; // e.g., 50 (R$)
  payType: 'hora' | 'vídeo' | 'diária' | 'evento' | string;
  videoBonus: number; // e.g., 25 (R$)
  bonusCondition: string; // e.g. "Envio em 1080p60 em até 12h"
  hasActiveBonus: boolean;
  slotsTotal: number;
  slotsFilled: number;
  durationMinutes: number;
  image: string;
  description: string;
  requirements: string[];
  equipmentNeeded: string[];
  benefits?: string[];
  officialLink?: string;
  postedDate: string;
  updatedAt?: string;
  scheduleTime?: string; // ex: "08:00 às 17:00" ou "Horário flexível"
  status?: 'ativa' | 'expirada' | 'preenchida';
  isUrgent?: boolean;
  isDailyMission?: boolean; // Missão diária de resgate rápido (expira no prazo de 24h)
  expiresAt?: string; // Data/hora limite de expiração ISO string
  expiresInHours?: number; // Horas restantes para expirar (ex: 4h, 8h, 14h, 24h)
  contractorPhone?: string; // Telefone do contratante
  contractorWhatsapp?: string; // WhatsApp direto do contratante para contato rápido
  contractorContactName?: string; // Nome do responsável/coordenador da vaga
  contractorRole?: string; // Cargo/departamento do contratante
  missionUrgency?: 'critica' | 'alta' | 'moderada'; // Nível de urgência da missão de 24h
  
  // Camada de Geolocalização (Seções 22-25)
  city?: string; // ex: 'São Paulo'
  state?: string; // ex: 'SP'
  neighborhood?: string; // ex: 'Moema', 'Pinheiros', 'Centro'
  country?: string; // 'Brasil'
  postalCode?: string; // CEP
  latitude?: number; // Latitude decimal
  longitude?: number; // Longitude decimal
  distanceKm?: number; // Calculado dinamicamente em relação ao usuário
  completenessScore?: number; // Score de completude interna (0-100)
}

export interface VideoSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  freelancerName: string;
  pixKey: string;
  pixType: 'cpf' | 'email' | 'telefone' | 'aleatoria';
  submittedAt: string;
  status: 'approved' | 'in_review' | 'paid';
  baseEarned: number;
  bonusEarned: number;
  totalEarned: number;
  videoFileName: string;
  resolution: string;
  fps: number;
}

export interface AdminAssistantConfig {
  assistantName: string;
  model: string;
  temperature: number;
  welcomeMessage: string;
  systemInstruction: string;
  quickPrompts: string[];
}

export interface PlatformSettings {
  defaultBasePay: number;
  defaultVideoBonus: number;
  maxDeliveryHoursForBonus: number;
  autoApprovePix: boolean;
  announcementBannerText: string;
  isAnnouncementActive: boolean;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  indexNowKey?: string;
  appUrl?: string;
  tiktokMissionUrl?: string;
  tiktokRequireUnlock?: boolean;
}

export interface TikTokMission {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  link: string;
  rewardBadge: string;
  iconType: 'wheel' | 'video' | 'share';
  buttonLabel: string;
  isActive: boolean;
  order: number;
}

export interface TikTokAccessState {
  isUnlocked: boolean;
  unlockedAt: number | null;
  expiresAt: number | null;
  completedMissionId: string | null;
  remainingMs: number;
}


