export type WorkLocationType = 'all' | 'workplace' | 'home';

export interface Task {
  id: string;
  title: string;
  company: string;
  locationType: 'workplace' | 'home';
  category: 'Mecânica' | 'Elétrica' | 'Culinária' | 'Tecnologia' | 'Construção' | 'Artesanato' | 'Serviços' | 'Manutenção e projetos da casa' | 'Serviços automotivos' | string;
  basePay: number; // e.g., 50 (R$)
  payType: 'hora' | 'vídeo';
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
  postedDate: string;
  isUrgent?: boolean;
  isDailyMission?: boolean; // Missão diária de resgate rápido (expira no prazo de 24h)
  expiresAt?: string; // Data/hora limite de expiração ISO string
  expiresInHours?: number; // Horas restantes para expirar (ex: 4h, 8h, 14h, 24h)
  contractorPhone?: string; // Telefone do contratante
  contractorWhatsapp?: string; // WhatsApp direto do contratante para contato rápido
  contractorContactName?: string; // Nome do responsável/coordenador da vaga
  contractorRole?: string; // Cargo/departamento do contratante
  missionUrgency?: 'critica' | 'alta' | 'moderada'; // Nível de urgência da missão de 24h
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
}

