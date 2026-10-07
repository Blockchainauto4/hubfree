/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vercel Native Database Client Service (Vercel Postgres / REST API)
 * Zero external Firebase dependencies.
 */

import { Task, VideoSubmission } from '../types';
import { INITIAL_TASKS } from '../data/initialTasks';

const STORAGE_KEY_TASKS = 'freelahub_vercel_tasks';
const STORAGE_KEY_SUBMISSIONS = 'freelahub_vercel_submissions';
const STORAGE_KEY_USERS = 'freelahub_vercel_users';

/**
 * Initializes and seeds default tasks into storage/database.
 * Ensures daily missions with contractor contacts and 24h expiration are loaded.
 */
export async function seedInitialTasksIfEmpty(): Promise<void> {
  try {
    // 1. Try fetching from Vercel Serverless API (/api/tasks)
    const res = await fetch('/api/tasks', { method: 'GET' }).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(data));
        return;
      }
    }
  } catch (err) {
    // API not responding or in client-only mode
  }

  // 2. Ensure default initial tasks exist and have contractor phone numbers
  const cached = localStorage.getItem(STORAGE_KEY_TASKS);
  if (!cached) {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
  } else {
    try {
      const parsed: Task[] = JSON.parse(cached);
      // If cached tasks were saved before contractor contacts were added, merge or refresh initial tasks
      const hasContractorPhone = parsed.some((t) => !!t.contractorPhone);
      if (!hasContractorPhone) {
        const merged = parsed.map((item) => {
          const matchingInit = INITIAL_TASKS.find((init) => init.id === item.id);
          if (matchingInit) {
            return {
              ...item,
              isDailyMission: matchingInit.isDailyMission,
              expiresAt: matchingInit.expiresAt,
              expiresInHours: matchingInit.expiresInHours,
              contractorPhone: matchingInit.contractorPhone,
              contractorWhatsapp: matchingInit.contractorWhatsapp,
              contractorContactName: matchingInit.contractorContactName,
              contractorRole: matchingInit.contractorRole,
              missionUrgency: matchingInit.missionUrgency,
            };
          }
          return item;
        });
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(merged));
      }
    } catch {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
    }
  }
}

/**
 * Subscribes or fetches live task postings from Vercel Database / API.
 */
export function subscribeToTasks(onUpdate: (tasks: Task[]) => void): () => void {
  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks').catch(() => null);
      if (res && res.ok) {
        const liveData = await res.json();
        if (Array.isArray(liveData) && liveData.length > 0) {
          localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(liveData));
          onUpdate(liveData);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Load from cached storage
    try {
      const cached = localStorage.getItem(STORAGE_KEY_TASKS);
      if (cached) {
        onUpdate(JSON.parse(cached));
        return;
      }
    } catch {
      // Fallback
    }

    onUpdate(INITIAL_TASKS);
  };

  loadTasks();

  // Polling interval for live updates (e.g. every 15s in client mode)
  const intervalId = setInterval(loadTasks, 15000);
  return () => clearInterval(intervalId);
}

/**
 * Saves a new daily freelance task to Vercel Postgres / API.
 */
export async function saveTaskToDb(task: Task): Promise<void> {
  // Update local state storage
  try {
    const cached = localStorage.getItem(STORAGE_KEY_TASKS);
    const list: Task[] = cached ? JSON.parse(cached) : INITIAL_TASKS;
    const updated = [task, ...list.filter((t) => t.id !== task.id)];
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local storage update failed', e);
  }

  // Sync to Vercel Serverless Function
  try {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
  } catch (err) {
    console.info('Task saved locally; will sync with Vercel Postgres on next deploy.', err);
  }
}

/**
 * Saves a video submission to Vercel Postgres / API.
 */
export async function saveSubmissionToDb(submission: VideoSubmission): Promise<void> {
  // Update local storage
  try {
    const cached = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    const list: VideoSubmission[] = cached ? JSON.parse(cached) : [];
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify([submission, ...list]));
  } catch (e) {
    console.warn(e);
  }

  // Sync to Vercel API
  try {
    await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
  } catch (err) {
    console.info('Submission recorded locally.', err);
  }
}

/**
 * Saves or updates user profile in Vercel Postgres / API.
 */
export async function saveUserToDb(user: {
  email: string;
  name: string;
  role: string;
  pixKey?: string;
  walletBalance?: number;
}): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY_USERS + '_' + user.email, JSON.stringify(user));
  } catch (e) {
    console.warn(e);
  }

  try {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  } catch {
    // Graceful offline fallback
  }
}

const STORAGE_KEY_MESSAGES = 'freelahub_messages_';

/**
 * Saves a chat message to the database (Vercel Postgres / API) with localStorage persistence.
 */
export async function saveChatMessageToDb(
  conversationId: string,
  msg: { sender: 'user' | 'model' | 'bot'; text: string; time?: string }
): Promise<void> {
  // 1. Local persistence
  try {
    const key = STORAGE_KEY_MESSAGES + conversationId;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...existing, msg]));
  } catch (err) {
    console.warn('LocalStorage chat save notice:', err);
  }

  // 2. Database API sync
  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        sender: msg.sender,
        text: msg.text,
      }),
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Loads conversation messages from the database (Vercel Postgres / API) or local cache.
 */
export async function fetchChatMessagesFromDb(
  conversationId: string
): Promise<Array<{ sender: 'user' | 'model' | 'bot'; text: string; time?: string }>> {
  // 1. Try fetching from live database API
  try {
    const res = await fetch(`/api/messages?conversationId=${encodeURIComponent(conversationId)}`).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEY_MESSAGES + conversationId, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // API not responding or offline
  }

  // 2. Read from cached storage
  try {
    const cached = localStorage.getItem(STORAGE_KEY_MESSAGES + conversationId);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Fallback
  }

  return [];
}

/**
 * Filter tasks to retrieve active daily missions that expire within 24 hours.
 */
export function getDailyMissions(tasks: Task[]): Task[] {
  const now = Date.now();
  return tasks.filter((t) => {
    // If explicitly marked as daily mission
    if (t.isDailyMission) return true;

    // Or if expiresInHours is defined and <= 24
    if (typeof t.expiresInHours === 'number' && t.expiresInHours <= 24) return true;

    // Or check if expiresAt timestamp is within 24 hours
    if (t.expiresAt) {
      const exp = new Date(t.expiresAt).getTime();
      const diffHours = (exp - now) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24;
    }

    return false;
  });
}

/**
 * Updates contractor contact details for a task in the database.
 */
export async function updateTaskContractorContactInDb(
  taskId: string,
  contractor: {
    contactName: string;
    phone: string;
    whatsapp?: string;
    role?: string;
  }
): Promise<void> {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_TASKS);
    if (cached) {
      const list: Task[] = JSON.parse(cached);
      const updated = list.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            contractorContactName: contractor.contactName,
            contractorPhone: contractor.phone,
            contractorWhatsapp: contractor.whatsapp || contractor.phone.replace(/\D/g, ''),
            contractorRole: contractor.role || task.contractorRole,
          };
        }
        return task;
      });
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('LocalStorage contractor contact update error:', err);
  }

  try {
    await fetch(`/api/tasks/${taskId}/contractor`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contractor),
    });
  } catch {
    // Graceful offline fallback
  }
}
