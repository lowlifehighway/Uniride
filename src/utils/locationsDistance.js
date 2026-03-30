// utils/locationUtils.js
import { CAMPUS_LOCATIONS } from '../config/mapbox'; // Adjust import path as needed

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Array} coord1 - [longitude, latitude]
 * @param {Array} coord2 - [longitude, latitude]
 * @returns {number} Distance in meters
 */
export const calculateDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Format distance for display
 * @param {number} distanceInMeters
 * @returns {string} Formatted distance
 */
export const formatDistance = (distanceInMeters) => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} meters`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(1)} km`;
  }
};

/**
 * Find the closest campus location to user's current position
 * @param {Object} userLocation - { latitude, longitude }
 * @param {number} userLocation.latitude
 * @param {number} userLocation.longitude
 * @returns {Object|null} Closest location object with distance or null if no locations
 */
export const findClosestLocation = (userLocation) => {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return null;
  }

  const userCoords = [userLocation.longitude, userLocation.latitude];
  const locations = Object.values(CAMPUS_LOCATIONS);

  if (locations.length === 0) return null;

  let closestLocation = null;
  let minDistance = Infinity;

  locations.forEach((location) => {
    const distance = calculateDistance(userCoords, location.coordinates);

    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = {
        ...location,
        distance: distance,
        distanceFormatted: formatDistance(distance),
      };
    }
  });

  return closestLocation;
};

/**
 * Optimized version using distance threshold
 * Skips locations that are obviously too far
 * @param {Object} userLocation - { latitude, longitude }
 * @param {number} thresholdKm - Distance threshold in kilometers (default: 5km)
 * @returns {Object|null} Closest location object with distance
 */
export const findClosestLocationOptimized = (userLocation, thresholdKm = 5) => {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return null;
  }

  const userCoords = [userLocation.longitude, userLocation.latitude];
  const thresholdDegrees = thresholdKm / 111; // Approx conversion: 1 degree ≈ 111km

  let closestLocation = null;
  let minDistance = Infinity;

  Object.values(CAMPUS_LOCATIONS).forEach((location) => {
    // Quick bounding box check
    const [lon, lat] = location.coordinates;
    const deltaLat = Math.abs(lat - userLocation.latitude);
    const deltaLon = Math.abs(lon - userLocation.longitude);

    // Skip if obviously outside threshold
    if (deltaLat > thresholdDegrees || deltaLon > thresholdDegrees) {
      return;
    }

    const distance = calculateDistance(userCoords, location.coordinates);

    // Additional check: only consider if within actual threshold
    if (distance <= thresholdKm * 1000 && distance < minDistance) {
      minDistance = distance;
      closestLocation = {
        ...location,
        distance: distance,
        distanceFormatted: formatDistance(distance),
      };
    }
  });

  // If no location found within threshold, return the absolute closest
  if (!closestLocation) {
    return findClosestLocation(userLocation);
  }

  return closestLocation;
};

/**
 * Find N closest locations (useful for suggestions)
 * @param {Object} userLocation - { latitude, longitude }
 * @param {number} count - Number of closest locations to return
 * @returns {Array} Array of closest locations sorted by distance
 */
export const findNClosestLocations = (userLocation, count = 5) => {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return [];
  }

  const userCoords = [userLocation.longitude, userLocation.latitude];

  // Calculate distance for all locations
  const locationsWithDistance = Object.values(CAMPUS_LOCATIONS).map(
    (location) => ({
      ...location,
      distance: calculateDistance(userCoords, location.coordinates),
    }),
  );

  // Sort by distance ascending
  locationsWithDistance.sort((a, b) => a.distance - b.distance);

  // Format distance and return requested count
  return locationsWithDistance.slice(0, count).map((loc) => ({
    ...loc,
    distanceFormatted: formatDistance(loc.distance),
  }));
};

/**
 * Check if user is within a certain radius of a specific location
 * @param {Object} userLocation - { latitude, longitude }
 * @param {string} locationId - ID of the campus location
 * @param {number} radiusMeters - Radius in meters
 * @returns {boolean} True if user is within radius
 */
export const isWithinRadius = (
  userLocation,
  locationId,
  radiusMeters = 100,
) => {
  if (!userLocation || !locationId) return false;

  const location = CAMPUS_LOCATIONS[locationId];
  if (!location) return false;

  const userCoords = [userLocation.longitude, userLocation.latitude];
  const distance = calculateDistance(userCoords, location.coordinates);

  return distance <= radiusMeters;
};

/**
 * Get all locations within a certain radius
 * @param {Object} userLocation - { latitude, longitude }
 * @param {number} radiusMeters - Radius in meters
 * @returns {Array} Locations within the radius
 */
export const getLocationsWithinRadius = (userLocation, radiusMeters = 500) => {
  if (!userLocation) return [];

  const userCoords = [userLocation.longitude, userLocation.latitude];

  return Object.values(CAMPUS_LOCATIONS)
    .map((location) => {
      const distance = calculateDistance(userCoords, location.coordinates);
      return {
        ...location,
        distance,
        distanceFormatted: formatDistance(distance),
      };
    })
    .filter((location) => location.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
};
