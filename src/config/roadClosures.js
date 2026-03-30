/**
 * Manual road closure tracking
 */
export const ROAD_CLOSURES = [
  {
    id: 'test_closure_1',
    name: 'High School Gate',
    description: 'closed',
    coordinates: [
      [3.71973, 6.890228],
      [3.719611, 6.890474],
    ],
    status: 'closed',
    reason: 'Testing',
    startDate: '2025-02-01',
    endDate: '2025-12-31',
    active: true,
    severity: 'high',
  },
];

export const getActiveClosures = () => {
  const now = new Date();

  return ROAD_CLOSURES.filter((closure) => {
    if (!closure.active) return false;

    const start = new Date(closure.startDate);
    const end = new Date(closure.endDate);

    return now >= start && now <= end;
  });
};

export const isNearClosedRoad = (coordinate, threshold = 0.0005) => {
  const activeClosures = getActiveClosures();

  for (const closure of activeClosures) {
    for (const closurePoint of closure.coordinates) {
      const distance = Math.sqrt(
        Math.pow(coordinate[0] - closurePoint[0], 2) +
          Math.pow(coordinate[1] - closurePoint[1], 2),
      );

      if (distance < threshold) {
        return { isClosed: true, closure };
      }
    }
  }

  return { isClosed: false, closure: null };
};
