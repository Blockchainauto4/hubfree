/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TikTokAccessState, TikTokMission } from '../types';
import { DEFAULT_TIKTOK_MISSIONS, OFFICIAL_TIKTOK_MISSION_URL } from '../data/defaultTikTokMissions';

const STORAGE_KEY_TIKTOK_ACCESS = 'freelahub_tiktok_access';
const STORAGE_KEY_TIKTOK_MISSIONS = 'freelahub_tiktok_missions';
const ACCESS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let sid = localStorage.getItem('freelahub_session_id');
  if (!sid) {
    sid = 'sid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('freelahub_session_id', sid);
  }
  return sid;
}

/**
 * Returns the current TikTok 24-hour access state.
 */
export function getTikTokAccessState(): TikTokAccessState {
  if (typeof window === 'undefined') {
    return {
      isUnlocked: false,
      unlockedAt: null,
      expiresAt: null,
      completedMissionId: null,
      remainingMs: 0,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_TIKTOK_ACCESS);
    if (raw) {
      const data = JSON.parse(raw);
      const now = Date.now();
      const expiresAt = Number(data.expiresAt) || 0;

      if (expiresAt > now) {
        return {
          isUnlocked: true,
          unlockedAt: Number(data.unlockedAt) || now,
          expiresAt,
          completedMissionId: data.completedMissionId || 'tiktok-mission-roda',
          remainingMs: expiresAt - now,
        };
      }
    }
  } catch (err) {
    console.warn('Error reading TikTok access state', err);
  }

  return {
    isUnlocked: false,
    unlockedAt: null,
    expiresAt: null,
    completedMissionId: null,
    remainingMs: 0,
  };
}

/**
 * Unlocks the client's access for exactly 24 hours after completing the TikTok mission.
 * Persists locally and synchronizes to Vercel Postgres / API.
 */
export async function unlockTikTokAccess(missionId: string = 'tiktok-mission-roda'): Promise<TikTokAccessState> {
  const now = Date.now();
  const expiresAt = now + ACCESS_DURATION_MS;
  const sessionId = getSessionId();

  const state: TikTokAccessState = {
    isUnlocked: true,
    unlockedAt: now,
    expiresAt,
    completedMissionId: missionId,
    remainingMs: ACCESS_DURATION_MS,
  };

  try {
    localStorage.setItem(STORAGE_KEY_TIKTOK_ACCESS, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save TikTok access locally', e);
  }

  // Dispatch global custom event for instant UI updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('freelahub_tiktok_access_changed', { detail: state }));
  }

  // Sync to database via API
  try {
    await fetch('/api/tiktok-missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        missionId,
        unlockedAt: now,
        expiresAt,
        action: 'UNLOCK_24H',
      }),
    });
  } catch (err) {
    console.info('TikTok unlock saved in local storage (offline/preview fallback)', err);
  }

  return state;
}

/**
 * Resets the 24h unlock state (useful for admin testing or when 24h expires).
 */
export function resetTikTokAccess(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_TIKTOK_ACCESS);
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('freelahub_tiktok_access_changed', {
        detail: {
          isUnlocked: false,
          unlockedAt: null,
          expiresAt: null,
          completedMissionId: null,
          remainingMs: 0,
        },
      })
    );
  }
}

/**
 * Subscribes to real-time changes in TikTok access state (e.g., when unlocked or when 24h tick down).
 */
export function subscribeToTikTokAccess(callback: (state: TikTokAccessState) => void): () => void {
  const handler = (event: any) => {
    if (event.detail) {
      callback(event.detail);
    } else {
      callback(getTikTokAccessState());
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('freelahub_tiktok_access_changed', handler);
  }

  // Periodic check for expiration every 30 seconds
  const interval = setInterval(() => {
    callback(getTikTokAccessState());
  }, 30000);

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('freelahub_tiktok_access_changed', handler);
    }
    clearInterval(interval);
  };
}

/**
 * Formats the remaining time (e.g. "23h 45m" or "59m 12s").
 */
export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return 'Expirado';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

/**
 * Fetches active TikTok missions from database / API with default fallback.
 */
export async function getActiveTikTokMissions(): Promise<TikTokMission[]> {
  const sessionId = getSessionId();
  try {
    const res = await fetch(`/api/tiktok-missions?sessionId=${encodeURIComponent(sessionId)}`, { method: 'GET' }).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (data?.userUnlock && Number(data.userUnlock.expires_at) > Date.now()) {
        const expiresAt = Number(data.userUnlock.expires_at);
        const unlockedAt = Number(data.userUnlock.unlocked_at) || Date.now();
        const state: TikTokAccessState = {
          isUnlocked: true,
          unlockedAt,
          expiresAt,
          completedMissionId: data.userUnlock.mission_id || 'tiktok-mission-roda',
          remainingMs: Math.max(0, expiresAt - Date.now()),
        };
        localStorage.setItem(STORAGE_KEY_TIKTOK_ACCESS, JSON.stringify(state));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('freelahub_tiktok_access_changed', { detail: state }));
        }
      }
      if (Array.isArray(data?.missions) && data.missions.length > 0) {
        localStorage.setItem(STORAGE_KEY_TIKTOK_MISSIONS, JSON.stringify(data.missions));
        return data.missions;
      }
    }
  } catch (err) {
    // API fallback
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEY_TIKTOK_MISSIONS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return DEFAULT_TIKTOK_MISSIONS;
}
