export type WorkLocationType = 'all' | 'workplace' | 'home';

export interface Task {
  id: string;
  title: string;
  company: string;
  locationType: 'workplace' | 'home';
  category: 'Mecânica' | 'Elétrica' | 'Culinária' | 'Tecnologia' | 'Construção' | 'Artesanato' | 'Serviços';
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

