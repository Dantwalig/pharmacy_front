// src/services/pharmacies.ts
// Placeholder API service for pharmacy location data
// TODO: Replace mock data with real API calls when backend /api/pharmacies/locations is ready

import { api, unwrapData } from '@/lib/api';
import { ApiResponse } from '@/types';
import { PharmacyLocation } from '@/features/map/pharmacyData';

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
    const res = await api.get('/pharmacies/locations');
    // Handle flat array, { data: [] }, or legacy { pharmacies: [] } shapes
    const data = unwrapData<PharmacyLocation>(res.data);
    if (data.length === 0 && Array.isArray(res.data?.pharmacies)) return res.data.pharmacies;
    return data;
  } catch (error) {
    console.error('Error fetching global locations:', error);
    return [];
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
  if (!lat || !lng) {
    return [];
  }
  try {
    const res = await api.get<ApiResponse<PharmacyLocation[]>>(`/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`);
    return unwrapData<PharmacyLocation>(res.data);
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    return [];
  }
}

/**
 * Fetch a single pharmacy by ID
 * TODO: Backend endpoint GET /pharmacies/:id
 */
export async function fetchPharmacyById(id: string): Promise<PharmacyLocation | null> {
  try {
    const res = await api.get<ApiResponse<PharmacyLocation>>(`/pharmacies/${id}`);
    return res.data.data ?? null;
  } catch (error) {
    console.error('Error fetching pharmacy by ID:', error);
    return null;
  }
}
