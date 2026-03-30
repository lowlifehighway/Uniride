import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const RouteLayer = ({ coordinates }) => {
  if (!coordinates || coordinates.length < 2) return null;

  const routeFeature = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coordinates,
    },
  };

  return (
    <MapboxGL.ShapeSource id="routeSource" shape={routeFeature}>
      <MapboxGL.LineLayer
        id="routeLine"
        style={{
          lineColor: COLORS.primary,
          lineWidth: 4,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </MapboxGL.ShapeSource>
  );
};

export default RouteLayer;
