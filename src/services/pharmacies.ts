// src/services/pharmacies.ts
// Placeholder API service for pharmacy location data
// TODO: Replace mock data with real API calls when backend /api/pharmacies/locations is ready

import { MOCK_PHARMACIES, PharmacyLocation } from '@/features/map/pharmacyData';

export interface PharmacyLocationResponse {
  pharmacies: PharmacyLocation[];
  total: number;
}

/**
 * Fetch all pharmacy locations for the map
 * TODO: Uncomment real API call and remove mock return
 */
export async function fetchPharmacyLocations(): Promise<PharmacyLocation[]> {
  // TODO: replace with real endpoint
  // import api from '@/lib/api';
  // const res = await api.get<PharmacyLocationResponse>('/pharmacies/locations');
  // return res.data.pharmacies;

  // Mock delay to simulate network
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_PHARMACIES;
}

/**
 * Fetch pharmacies near a given lat/lng within radiusKm
 * TODO: Backend should accept ?lat=&lng=&radius= query params
 * e.g. GET /pharmacies/nearby?lat=-1.9441&lng=30.0619&radius=5
 */
export async function fetchNearbyPharmacies(
  lat: number,
  lng: number,
  radiusKm = 5
): Promise<PharmacyLocation[]> {
  // TODO: replace with real endpoint
  // const res = await api.get(`/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`);
  // return res.data.pharmacies;

  await new Promise((r) => setTimeout(r, 400));

  // Haversine formula for mock distance calculation
  const toRad = (v: number) => (v * Math.PI) / 180;
  return MOCK_PHARMACIES.map((p) => {
    const dLat = toRad(p.latitude - lat);
    const dLon = toRad(p.longitude - lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) * Math.cos(toRad(p.latitude)) * Math.sin(dLon / 2) ** 2;
    const distance = parseFloat((6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
    return { ...p, distance };
  })
    .filter((p) => (p.distance ?? Infinity) <= radiusKm * 5)
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
}

/**
 * Fetch a single pharmacy by ID
 * TODO: Backend endpoint GET /pharmacies/:id
 */
export async function fetchPharmacyById(id: string): Promise<PharmacyLocation | null> {
  // TODO: const res = await api.get(`/pharmacies/${id}`); return res.data;
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_PHARMACIES.find((p) => p.id === id) ?? null;
}
