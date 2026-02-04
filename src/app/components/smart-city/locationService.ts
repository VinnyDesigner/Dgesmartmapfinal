export interface UserLocation {
  lat: number;
  lon: number;
  accuracy?: number;
  timestamp: number;
  name?: string; // For manually entered locations
  isManual?: boolean; // Flag to indicate if location was manually entered
}

export type LocationStatus = 'detecting' | 'success' | 'denied' | 'error' | 'idle';

export interface LocationResult {
  status: LocationStatus;
  location?: UserLocation;
  error?: string;
}

/**
 * Request user's current location using browser Geolocation API
 */
export const getUserLocation = (): Promise<LocationResult> => {
  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      resolve({
        status: 'error',
        error: 'Geolocation is not supported by your browser'
      });
      return;
    }

    // Request current position
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        resolve({
          status: 'success',
          location: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          }
        });
      },
      // Error callback
      (error) => {
        let status: LocationStatus = 'error';
        let errorMessage = 'Unable to retrieve your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            status = 'denied';
            errorMessage = 'Location access was denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        resolve({
          status,
          error: errorMessage
        });
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};