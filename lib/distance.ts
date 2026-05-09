/**
 * Distance calculation utilities using Haversine formula
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate (latitude, longitude)
 * @param coord2 Second coordinate (latitude, longitude)
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers

  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km" or "500 m")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }
  return `${Math.round(distanceKm)} km`;
}

/**
 * Check if a location is within a specified radius
 * @param center Center coordinates
 * @param point Point to check
 * @param radiusKm Radius in kilometers
 * @returns True if point is within radius
 */
export function isWithinRadius(
  center: Coordinates,
  point: Coordinates,
  radiusKm: number
): boolean {
  const distance = calculateDistance(center, point);
  return distance <= radiusKm;
}

/**
 * Sort locations by distance from a reference point
 * @param reference Reference coordinates
 * @param locations Array of locations with coordinates
 * @returns Sorted array with distance added
 */
export function sortByDistance<T extends Coordinates>(
  reference: Coordinates,
  locations: T[]
): (T & { distance: number })[] {
  return locations
    .map((location) => ({
      ...location,
      distance: calculateDistance(reference, location),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Filter locations within a radius
 * @param center Center coordinates
 * @param locations Array of locations with coordinates
 * @param radiusKm Radius in kilometers
 * @returns Filtered array with distance added
 */
export function filterByRadius<T extends Coordinates>(
  center: Coordinates,
  locations: T[],
  radiusKm: number
): (T & { distance: number })[] {
  return locations
    .map((location) => ({
      ...location,
      distance: calculateDistance(center, location),
    }))
    .filter((location) => location.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

// Default coordinates for major South African cities
export const SA_CITY_COORDINATES: Record<string, Coordinates> = {
  "Johannesburg": { latitude: -26.2041, longitude: 28.0473 },
  "Cape Town": { latitude: -33.9249, longitude: 18.4241 },
  "Durban": { latitude: -29.8587, longitude: 31.0218 },
  "Pretoria": { latitude: -25.7479, longitude: 28.2293 },
  "Port Elizabeth": { latitude: -33.9608, longitude: 25.6022 },
  "Bloemfontein": { latitude: -29.0852, longitude: 26.1596 },
  "East London": { latitude: -33.0153, longitude: 27.9116 },
  "Polokwane": { latitude: -23.9045, longitude: 29.4689 },
  "Nelspruit": { latitude: -25.4753, longitude: 30.9694 },
  "Kimberley": { latitude: -28.7282, longitude: 24.7499 },
  "Sandton": { latitude: -26.1076, longitude: 28.0567 },
  "Midrand": { latitude: -25.9891, longitude: 28.1270 },
  "Roodepoort": { latitude: -26.1625, longitude: 27.8725 },
  "Stellenbosch": { latitude: -33.9346, longitude: 18.8667 },
  "Ballito": { latitude: -29.5390, longitude: 31.2140 },
};

/**
 * Get coordinates for a city name (fallback lookup)
 * @param cityName Name of the city
 * @returns Coordinates or null if not found
 */
export function getCityCoordinates(cityName: string): Coordinates | null {
  return SA_CITY_COORDINATES[cityName] || null;
}
