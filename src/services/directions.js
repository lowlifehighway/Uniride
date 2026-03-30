import { MAPBOX_ACCESS_TOKEN } from '../config/mapbox';
import { getActiveClosures } from '../config/roadClosures';

/**
 * Get directions while silently avoiding closed roads
 */
export const getDirections = async (start, end, profile = 'driving') => {
  try {
    // Validate coordinates
    if (!start || !end || start.length !== 2 || end.length !== 2) {
      throw new Error('Invalid coordinates provided');
    }

    const closures = getActiveClosures();

    // If there are active closures, try avoidance routing
    if (closures.length > 0) {
      const avoidanceResult = await getDirectionsWithAvoidance(
        start,
        end,
        profile,
        closures,
      );

      if (avoidanceResult) {
        console.log(`✅ Successfully avoided ${closures.length} closure(s)`);
        return avoidanceResult;
      }

      console.log('⚠️ Avoidance failed, using standard route');
    }

    // No closures or avoidance failed, use standard routing
    return await getStandardDirections(start, end, profile);
  } catch (error) {
    console.error('Error fetching directions directions api:', error);
    return null;
  }
};

/**
 * Standard directions without avoidance
 */
const getStandardDirections = async (start, end, profile) => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&steps=true&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;

  console.log('Fetching standard route...');

  const response = await fetch(url);
  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error(`Directions API error: ${data.code || 'No routes found'}`);
  }

  const route = data.routes[0];

  return {
    coordinates: route.geometry.coordinates,
    distance: route.distance,
    duration: route.duration,
    steps: route.legs[0].steps,
    avoidedClosures: 0,
  };
};

/**
 * Get directions with road closure avoidance
 */
const getDirectionsWithAvoidance = async (start, end, profile, closures) => {
  console.log(`Calculating route avoiding ${closures.length} closure(s)...`);

  // Find closures that are actually in the path
  const relevantClosures = closures.filter((closure) =>
    isClosureInPath(closure, start, end),
  );

  if (relevantClosures.length === 0) {
    console.log('No closures in path, using standard route');
    return null;
  }

  console.log(`Found ${relevantClosures.length} closure(s) in path`);

  // Calculate ONE strategic waypoint to avoid all closures
  const waypoint = calculateBestDetourPoint(start, end, relevantClosures);

  if (!waypoint) {
    console.log('Could not calculate valid waypoint');
    return null;
  }

  // Build URL with waypoint
  const coordinates = `${start[0]},${start[1]};${waypoint[0]},${waypoint[1]};${end[0]},${end[1]}`;

  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?geometries=geojson&steps=true&overview=full&waypoints=0;2&access_token=${MAPBOX_ACCESS_TOKEN}`;

  console.log('Requesting avoidance route...');

  const response = await fetch(url);
  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    console.log(`Mapbox error: ${data.code || 'Unknown'}`);
    if (data.message) {
      console.log(`Message: ${data.message}`);
    }
    return null;
  }

  const route = data.routes[0];

  // Verify the route actually avoids the closures
  if (
    doesRouteIntersectClosures(route.geometry.coordinates, relevantClosures)
  ) {
    console.log('Generated route still intersects closures, rejecting');
    return null;
  }

  // Combine steps from all legs
  const allSteps = route.legs.reduce((acc, leg) => [...acc, ...leg.steps], []);

  return {
    coordinates: route.geometry.coordinates,
    distance: route.distance,
    duration: route.duration,
    steps: allSteps,
    avoidedClosures: relevantClosures.length,
  };
};

/**
 * Check if a closure is in the general path
 */
const isClosureInPath = (closure, start, end) => {
  const closureCenter = getClosureCenter(closure.coordinates);

  // Create bounding box with generous buffer
  const buffer = 0.005; // ~500 meters
  const minLng = Math.min(start[0], end[0]) - buffer;
  const maxLng = Math.max(start[0], end[0]) + buffer;
  const minLat = Math.min(start[1], end[1]) - buffer;
  const maxLat = Math.max(start[1], end[1]) + buffer;

  const inBounds =
    closureCenter[0] >= minLng &&
    closureCenter[0] <= maxLng &&
    closureCenter[1] >= minLat &&
    closureCenter[1] <= maxLat;

  if (!inBounds) return false;

  // Also check if it's close to the direct line
  const distanceToLine = pointToLineDistance(closureCenter, start, end);
  const maxDistance = 0.003; // ~300 meters from direct line

  return distanceToLine < maxDistance;
};

/**
 * Calculate the best single detour point to avoid all closures
 */
const calculateBestDetourPoint = (start, end, closures) => {
  // Get average center of all closures
  const closureCenters = closures.map((c) => getClosureCenter(c.coordinates));

  const avgCenter = [
    closureCenters.reduce((sum, c) => sum + c[0], 0) / closureCenters.length,
    closureCenters.reduce((sum, c) => sum + c[1], 0) / closureCenters.length,
  ];

  // Calculate perpendicular offset
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];

  // Perpendicular vector
  const perpX = -dy;
  const perpY = dx;

  // Normalize
  const length = Math.sqrt(perpX * perpX + perpY * perpY);
  if (length === 0) return null;

  const normX = perpX / length;
  const normY = perpY / length;

  // Offset distance (300-500 meters)
  const offset = 0.004; // ~400 meters

  // Create two candidate waypoints (both sides)
  const waypoint1 = [
    avgCenter[0] + normX * offset,
    avgCenter[1] + normY * offset,
  ];

  const waypoint2 = [
    avgCenter[0] - normX * offset,
    avgCenter[1] - normY * offset,
  ];

  // Choose the waypoint that creates the shorter total distance
  const dist1 = getDistance(start, waypoint1) + getDistance(waypoint1, end);
  const dist2 = getDistance(start, waypoint2) + getDistance(waypoint2, end);

  const bestWaypoint = dist1 < dist2 ? waypoint1 : waypoint2;

  console.log(
    `Detour waypoint: [${bestWaypoint[0].toFixed(6)}, ${bestWaypoint[1].toFixed(6)}]`,
  );

  return bestWaypoint;
};

/**
 * Check if a route intersects with any closures
 */
const doesRouteIntersectClosures = (routeCoords, closures) => {
  const threshold = 0.0003; // ~30 meters

  for (const coord of routeCoords) {
    for (const closure of closures) {
      for (const closurePoint of closure.coordinates) {
        const dist = getDistance(coord, closurePoint);
        if (dist < threshold) {
          console.log(
            `Route still passes within ${(dist * 111000).toFixed(0)}m of closure`,
          );
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Calculate distance from point to line segment
 */
const pointToLineDistance = (point, lineStart, lineEnd) => {
  const [px, py] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return getDistance(point, lineStart);
  }

  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)),
  );

  const closestPoint = [x1 + t * dx, y1 + t * dy];

  return getDistance(point, closestPoint);
};

/**
 * Get center point of closure
 */
const getClosureCenter = (coordinates) => {
  if (coordinates.length === 1) {
    return coordinates[0];
  }

  const avgLng =
    coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
  const avgLat =
    coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;

  return [avgLng, avgLat];
};

/**
 * Calculate distance between two points
 */
const getDistance = (point1, point2) => {
  const dx = point2[0] - point1[0];
  const dy = point2[1] - point1[1];
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Format distance for display
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration for display
 */
export const formatDuration = (seconds) => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes > 0 ? `${remainingMinutes} min` : ''}`;
};
