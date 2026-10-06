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

  // 2. Ensure default initial tasks exist in local cache
  const cached = localStorage.getItem(STORAGE_KEY_TASKS);
  if (!cached) {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
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
