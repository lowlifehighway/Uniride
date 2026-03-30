import MapboxGL from '@rnmapbox/maps';
import { MAPBOX_ACCESS_TOKEN } from '../../../config/mapbox';

// Configure Mapbox
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

// Disable telemetry (optional, for privacy)
MapboxGL.setTelemetryEnabled(false);

// Export Mapbox components
export const MapView = MapboxGL.MapView;
export const Camera = MapboxGL.Camera;
export const UserLocation = MapboxGL.UserLocation;
export const ShapeSource = MapboxGL.ShapeSource;
export const SymbolLayer = MapboxGL.SymbolLayer;
export const LineLayer = MapboxGL.LineLayer;
export const CircleLayer = MapboxGL.CircleLayer;
export const Images = MapboxGL.Images;
export const MarkerView = MapboxGL.MarkerView;

export default MapView;
