/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TikTokMission } from '../types';

export const OFFICIAL_TIKTOK_MISSION_URL = 'https://www.tiktok.com/d/1/ZS9DgKjpR7ppT-MOm13/';

export const DEFAULT_TIKTOK_MISSIONS: TikTokMission[] = [
  {
    id: 'tiktok-mission-roda',
    title: 'Gire a Roda no TikTok e Ganhe Recompensas',
    subtitle: 'Missão Principal • Libera Botão de Contato com Contratante (24h)',
    description: 'Acesse o TikTok oficial, gire a roda da sorte premiada e desbloqueie o botão para falar direto no WhatsApp e ver telefones de todos os contratantes por 24 horas.',
    link: OFFICIAL_TIKTOK_MISSION_URL,
    rewardBadge: '🎁 Desbloqueio Oficial 24h',
    iconType: 'wheel',
    buttonLabel: 'Girar a Roda no TikTok',
    isActive: true,
    order: 1,
  },
  {
    id: 'tiktok-mission-video',
    title: 'Assistir Vídeo Oficial das Vagas no TikTok',
    subtitle: 'Guia Rápido de Gravação POV 1080p & Pagamento PIX',
    description: 'Assista às instruções do TikTok sobre como comprovar sua participação nas tarefas freelancer e garantir o pagamento via PIX no término do serviço.',
    link: OFFICIAL_TIKTOK_MISSION_URL,
    rewardBadge: '⚡ Passe Diário Ativo',
    iconType: 'video',
    buttonLabel: 'Abrir Vídeo no TikTok',
    isActive: true,
    order: 2,
  },
  {
    id: 'tiktok-mission-compartilhar',
    title: 'Compartilhar a Roda do TikTok com um Amigo',
    subtitle: 'Acesso VIP & Renovação Prioritária',
    description: 'Convide outros freelancers e amigos para girar a roda e receber notificações de novas vagas e bônus em primeira mão.',
    link: OFFICIAL_TIKTOK_MISSION_URL,
    rewardBadge: '⭐ Renovação 24h',
    iconType: 'share',
    buttonLabel: 'Compartilhar no TikTok',
    isActive: true,
    order: 3,
  },
];
