// src/services/pharmacies.ts
// Placeholder API service for pharmacy location data
// TODO: Replace mock data with real API calls when backend /api/pharmacies/locations is ready

import { MOCK_PHARMACIES, PharmacyLocation } from '@/features/map/pharmacyData';
import { api } from '@/lib/api';

export interface PharmacyLocationResponse {
  pharmacies: PharmacyLocation[];
  total: number;
}

export interface FetchResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all pharmacy locations for the map
 * TODO: Uncomment real API call and remove mock return
 */
export async function fetchPharmacyLocations(): Promise<FetchResult<PharmacyLocation[]>> {
  try {
    const res = await api.get<PharmacyLocationResponse>('/pharmacies/locations');
    return { data: res.data.pharmacies, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to load pharmacies' 
    };
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
): Promise<FetchResult<PharmacyLocation[]>> {
  if (!lat || !lng) {
    return {
      data: null,
      error: 'Location coordinates are required',
    };
  }

  try {
    const res = await api.get(`/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`);
    // Backend returns data in data array when successful
    const pharmacies = res.data?.data ?? res.data ?? [];
    return { data: pharmacies, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load nearby pharmacies';
    console.error('Error fetching nearby locations:', error);
    return { 
      data: null, 
      error: errorMessage 
    };
  }
}

/**
 * Fetch a single pharmacy by ID
 * TODO: Backend endpoint GET /pharmacies/:id
 */
export async function fetchPharmacyById(id: string): Promise<FetchResult<PharmacyLocation>> {
  if (!id) {
    return { 
      data: null, 
      error: 'Pharmacy ID is required' 
    };
  }

  try {
    const res = await api.get(`/pharmacies/${id}`);
    const pharmacy = res.data?.data ?? res.data ?? null;
    
    if (!pharmacy) {
      return { 
        data: null, 
        error: 'Pharmacy not found' 
      };
    }

    return { data: pharmacy, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load pharmacy details';
    console.error('Error fetching pharmacy by ID:', error);
    return { 
      data: null, 
      error: errorMessage 
    };
  }
}
