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
    try {
      const res = await api.get('/pharmacies/locations');
      const data = unwrapData<PharmacyLocation>(res.data);
      if (data.length > 0) return data;
      if (Array.isArray(res.data?.pharmacies) && res.data.pharmacies.length > 0) return res.data.pharmacies;
    } catch {
      // Fallback for roles without access to /locations (e.g. Branch Managers)
    }

    // Fallback mapping directly to public /pharmacies endpoint
    const res = await api.get('/pharmacies');
    return res.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      address: p.address || 'No Address',
      latitude: p.latitude,
      longitude: p.longitude,
      phone: p.phone || 'N/A',
      status: p.status === 'APPROVED' ? 'OPEN' : 'CLOSED',
      isActive: true,
      region: p.address ? p.address.split(',').pop()?.trim() : 'Unknown',
      hours: p.operatingHours ? 'Various' : '08:00 - 20:00',
    }));
  } catch {
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
  } catch {
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
  } catch {
    return null;
  }
}
