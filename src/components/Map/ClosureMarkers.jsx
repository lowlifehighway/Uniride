import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import { getActiveClosures } from '../../config/roadClosures';
import { COLORS } from '../../constants/colors';

const ClosureMarkers = () => {
  const closures = getActiveClosures();

  if (closures.length === 0) return null;

  return (
    <>
      {closures.map((closure) => {
        // Create feature for the closure
        const lineFeature = {
          type: 'Feature',
          properties: {
            name: closure.name,
            reason: closure.reason,
          },
          geometry: {
            type: 'LineString',
            coordinates: closure.coordinates,
          },
        };

        return (
          <MapboxGL.ShapeSource
            key={closure.id}
            id={`closure-${closure.id}`}
            shape={lineFeature}
          >
            <MapboxGL.LineLayer
              id={`closure-line-${closure.id}`}
              style={{
                lineColor: COLORS.destructiveRed,
                lineWidth: 6,
                lineDasharray: [2, 2],
                lineOpacity: 0.8,
              }}
            />

            {/* Add barrier symbols */}
            <MapboxGL.SymbolLayer
              id={`closure-symbol-${closure.id}`}
              style={{
                iconImage: 'construction', // You can use custom icons
                iconSize: 1.2,
                iconAllowOverlap: true,
              }}
            />
          </MapboxGL.ShapeSource>
        );
      })}
    </>
  );
};

export default ClosureMarkers;
