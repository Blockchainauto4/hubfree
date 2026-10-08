/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, UserLocation } from '../types';

/**
 * Standard Brazilian major cities coordinates reference for proximity fallback.
 */
export const BRAZIL_CITIES_COORDS: Record<string, { lat: number; lng: number; state: string }> = {
  'sao paulo': { lat: -23.55052, lng: -46.633308, state: 'SP' },
  'campinas': { lat: -22.909938, lng: -47.062633, state: 'SP' },
  'santos': { lat: -23.9608, lng: -46.3336, state: 'SP' },
  'sao bernardo do campo': { lat: -23.6914, lng: -46.5646, state: 'SP' },
  'rio de janeiro': { lat: -22.906847, lng: -43.172896, state: 'RJ' },
  'belo horizonte': { lat: -19.916681, lng: -43.934493, state: 'MG' },
  'curitiba': { lat: -25.428954, lng: -49.267137, state: 'PR' },
  'porto alegre': { lat: -30.034647, lng: -51.217658, state: 'RS' },
  'brasilia': { lat: -15.797515, lng: -47.891887, state: 'DF' },
  'salvador': { lat: -12.977749, lng: -38.50163, state: 'BA' }
};

/**
 * Requests the user's geolocation via standard browser HTML5 Geolocation API.
 * Only called on functional user request (e.g. "Buscar perto de mim").
 */
export async function requestUserLocation(): Promise<UserLocation> {
  if (!navigator.geolocation) {
    throw new Error('Geolocalização não é suportada por este navegador.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          permission: 'granted',
          city: 'Detectado via GPS'
        });
      },
      (error) => {
        let msg = 'Não foi possível obter sua localização.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permissão de localização negada pelo usuário.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  });
}

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place (ex: 3.4 km)
}

/**
 * Annotates tasks with distance in km and filters by maximum radius.
 * Available radii: 1, 5, 10, 25, 50, 100 km.
 */
export function filterTasksByRadius(
  tasks: Task[],
  userLat: number,
  userLon: number,
  radiusKm: number | null
): Task[] {
  const withDistance = tasks.map((task) => {
    if (typeof task.latitude === 'number' && typeof task.longitude === 'number') {
      const distance = calculateDistanceKm(userLat, userLon, task.latitude, task.longitude);
      return { ...task, distanceKm: distance };
    }
    // Remote or unpositioned tasks
    return task;
  });

  if (!radiusKm) {
    return withDistance;
  }

  return withDistance.filter((t) => {
    if (typeof t.distanceKm === 'number') {
      return t.distanceKm <= radiusKm;
    }
    // If user filtered by radius, workplace tasks without coordinates don't match,
    // but remote home tasks can be included optionally.
    return t.locationType === 'home';
  });
}
