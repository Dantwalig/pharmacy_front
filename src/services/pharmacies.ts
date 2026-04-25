// src/services/pharmacies.ts
// Placeholder API service for pharmacy location data
// TODO: Replace mock data with real API calls when backend /api/pharmacies/locations is ready

import { MOCK_PHARMACIES, PharmacyLocation } from '@/features/map/pharmacyData';
import { api } from '@/lib/api';

export interface PharmacyLocationResponse {
  pharmacies: PharmacyLocation[];
  total: number;
}

/**
 * Fetch all pharmacy locations for the map
 * TODO: Uncomment real API call and remove mock return
 */
export async function fetchPharmacyLocations(): Promise<PharmacyLocation[]> {
  try {
    const res = await api.get<PharmacyLocationResponse>('/pharmacies/locations');
    return res.data.pharmacies;
  } catch (error) {
    console.error('Error fetching global locations:', error);
    return MOCK_PHARMACIES; // Fallback to mock on error
  }
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
  try {
    const res = await api.get(`/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`);
    // Backend returns data in data array when successful
    return res.data?.data ?? res.data ?? [];
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    
    // Original mock fallback on error
    await new Promise((r) => setTimeout(r, 400));
    const toRad = (v: number) => (v * Math.PI) / 180;
    return MOCK_PHARMACIES.map((p) => {
      const dLat = toRad(p.latitude - lat);
      const dLon = toRad(p.longitude - lng);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(p.latitude)) * Math.sin(dLon / 2) ** 2;
      const distance = parseFloat((6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
      return { ...p, distance };
    }).filter((p) => (p.distance ?? Infinity) <= radiusKm * 5).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }
}

/**
 * Fetch a single pharmacy by ID
 * TODO: Backend endpoint GET /pharmacies/:id
 */
export async function fetchPharmacyById(id: string): Promise<PharmacyLocation | null> {
  try {
    const res = await api.get(`/pharmacies/${id}`);
    return res.data?.data ?? res.data ?? null;
  } catch (error) {
    console.error('Error fetching pharmacy by ID:', error);
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_PHARMACIES.find((p) => p.id === id) ?? null;
  }
}
