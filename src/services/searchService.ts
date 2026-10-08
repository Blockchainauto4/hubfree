/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, WorkLocationType } from '../types';
import { calculateDistanceKm } from './geoService';

export interface StructuredSearchCriteria {
  rawQuery: string;
  category?: string;
  locationKeyword?: string;
  locationType?: WorkLocationType;
  maxDistanceKm?: number;
  onlyDailyMission?: boolean;
  minPay?: number;
}

/**
 * Intelligent natural language search parser.
 * Maps natural input like "eletricista em são paulo" or "em casa" or "hoje 24h"
 * into structured search criteria safely, without inventing data.
 */
export function parseNaturalLanguageQuery(query: string): StructuredSearchCriteria {
  const lower = query.toLowerCase().trim();
  const criteria: StructuredSearchCriteria = { rawQuery: query };

  if (!lower) return criteria;

  // 1. Detect location type
  if (lower.includes('em casa') || lower.includes('home') || lower.includes('remoto')) {
    criteria.locationType = 'home';
  } else if (lower.includes('no trabalho') || lower.includes('presencial') || lower.includes('na empresa')) {
    criteria.locationType = 'workplace';
  }

  // 2. Detect 24h / daily missions urgency
  if (lower.includes('24h') || lower.includes('hoje') || lower.includes('urgente') || lower.includes('expira')) {
    criteria.onlyDailyMission = true;
  }

  // 3. Detect categories
  const categoryKeywords: Record<string, string> = {
    'eletric': 'Elétrica',
    'mecân': 'Mecânica',
    'carro': 'Serviços automotivos',
    'auto': 'Serviços automotivos',
    'casa': 'Manutenção e projetos da casa',
    'manuten': 'Manutenção e projetos da casa',
    'repar': 'Manutenção e projetos da casa',
    'pão': 'Culinária',
    'cozinh': 'Culinária',
    'culin': 'Culinária',
    'sold': 'Construção',
    'constru': 'Construção',
    'pedreir': 'Construção',
    'program': 'Tecnologia',
    'ti': 'Tecnologia',
    'comput': 'Tecnologia',
    'tecno': 'Tecnologia',
  };

  for (const [key, catName] of Object.entries(categoryKeywords)) {
    if (lower.includes(key)) {
      criteria.category = catName;
      break;
    }
  }

  // 4. Detect major cities/neighborhoods
  const locations = ['são paulo', 'sp', 'moema', 'pinheiros', 'campinas', 'rio de janeiro', 'rj', 'santos', 'curitiba', 'belo horizonte'];
  for (const loc of locations) {
    if (lower.includes(loc)) {
      criteria.locationKeyword = loc;
      break;
    }
  }

  return criteria;
}

/**
 * Combined search matching tasks against structured filters and text.
 */
export function searchTasks(
  tasks: Task[],
  criteria: StructuredSearchCriteria,
  userCoords?: { lat: number; lng: number }
): Task[] {
  return tasks.filter((task) => {
    // Exclude expired tasks if status is explicitly expired
    if (task.status === 'expirada') return false;

    // Category filter
    if (criteria.category && task.category) {
      if (!task.category.toLowerCase().includes(criteria.category.toLowerCase())) {
        return false;
      }
    }

    // Location type filter
    if (criteria.locationType && criteria.locationType !== 'all') {
      if (task.locationType !== criteria.locationType) return false;
    }

    // Daily mission filter
    if (criteria.onlyDailyMission && !task.isDailyMission) {
      return false;
    }

    // Location keyword
    if (criteria.locationKeyword) {
      const q = criteria.locationKeyword.toLowerCase();
      const inCity = task.city?.toLowerCase().includes(q);
      const inNeigh = task.neighborhood?.toLowerCase().includes(q);
      const inDesc = task.description.toLowerCase().includes(q);
      if (!inCity && !inNeigh && !inDesc) return false;
    }

    // Raw query keyword search
    if (criteria.rawQuery && criteria.rawQuery.length > 2) {
      const words = criteria.rawQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const target = `${task.title} ${task.company} ${task.category} ${task.description} ${task.city || ''} ${task.neighborhood || ''}`.toLowerCase();
      const anyMatch = words.some((w) => target.includes(w));
      if (!anyMatch) return false;
    }

    // Distance filter
    if (criteria.maxDistanceKm && userCoords && typeof task.latitude === 'number' && typeof task.longitude === 'number') {
      const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, task.latitude, task.longitude);
      if (dist > criteria.maxDistanceKm) return false;
    }

    return true;
  });
}

/**
 * Evaluates internal completeness quality score of a task (0-100).
 * Never shown as contractor rating; used solely for quality assurance.
 */
export function calculateCompletenessScore(task: Task): { score: number; checklist: Record<string, boolean> } {
  const checklist = {
    title: !!task.title && task.title.length >= 8,
    description: !!task.description && task.description.length >= 30,
    basePay: typeof task.basePay === 'number' && task.basePay > 0,
    contactPhone: !!task.contractorPhone && task.contractorPhone.length >= 8,
    location: !!task.locationType && (task.locationType === 'home' || !!task.city),
    requirements: Array.isArray(task.requirements) && task.requirements.length > 0,
    image: !!task.image,
  };

  const weights: Record<string, number> = {
    title: 20,
    description: 25,
    basePay: 15,
    contactPhone: 15,
    location: 10,
    requirements: 10,
    image: 5,
  };

  let score = 0;
  for (const [key, pass] of Object.entries(checklist)) {
    if (pass) score += weights[key] || 0;
  }

  return { score, checklist };
}

/**
 * Detects whether a new task is clearly a duplicate of an existing task.
 */
export function detectDuplicateTask(
  candidate: Partial<Task>,
  existingTasks: Task[]
): { isDuplicate: boolean; matchedTaskId?: string; reason?: string } {
  if (!candidate.title) return { isDuplicate: false };

  const candidateTitle = candidate.title.toLowerCase().trim();
  const candidateComp = (candidate.company || '').toLowerCase().trim();

  for (const t of existingTasks) {
    if (candidate.id && t.id === candidate.id) continue;

    const tTitle = t.title.toLowerCase().trim();
    const tComp = t.company.toLowerCase().trim();

    // Identical company and title
    if (candidateComp && tComp && candidateComp === tComp && candidateTitle === tTitle) {
      return { isDuplicate: true, matchedTaskId: t.id, reason: 'Mesma empresa e mesmo cargo já cadastrado.' };
    }

    // Identical title and contractor phone
    if (candidate.contractorPhone && t.contractorPhone && candidate.contractorPhone === t.contractorPhone && candidateTitle === tTitle) {
      return { isDuplicate: true, matchedTaskId: t.id, reason: 'Mesmo telefone de contratante e título idêntico.' };
    }
  }

  return { isDuplicate: false };
}

/**
 * Recommends related tasks for a user based on current task category or location.
 */
export function getRecommendedTasks(currentTask: Task, allTasks: Task[], limit = 3): Task[] {
  return allTasks
    .filter((t) => t.id !== currentTask.id && t.status !== 'expirada')
    .sort((a, b) => {
      // Prioritize same category
      const aSameCat = a.category === currentTask.category ? 2 : 0;
      const bSameCat = b.category === currentTask.category ? 2 : 0;
      // Prioritize same city
      const aSameCity = a.city === currentTask.city ? 1 : 0;
      const bSameCity = b.city === currentTask.city ? 1 : 0;
      return bSameCat + bSameCity - (aSameCat + aSameCity);
    })
    .slice(0, limit);
}
