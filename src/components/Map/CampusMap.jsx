import React, { useState, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import {
  MAPBOX_ACCESS_TOKEN,
  CAMPUS_CENTER,
  MAP_STYLES,
} from '../../config/mapbox';

MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const CampusMap = ({
  children,
  style,
  showUserLocation = true,
  centerCoordinate = [CAMPUS_CENTER.longitude, CAMPUS_CENTER.latitude],
  zoomLevel = 15,
  pitch = 0,
  heading = 0,
  onPress,
}) => {
  const cameraRef = useRef(null);
  const mapRef = useRef(null);

  if (Platform.OS === 'web') {
    return <View style={[styles.webContainer, style]}>{children}</View>;
  }

  return (
    <MapboxGL.MapView
      ref={mapRef}
      style={[styles.map, style]}
      styleURL={MAP_STYLES.STREETS}
      onPress={onPress}
      compassEnabled={true}
      compassViewPosition={3}
      scaleBarEnabled={false}
    >
      <MapboxGL.Camera
        ref={cameraRef}
        zoomLevel={zoomLevel}
        centerCoordinate={centerCoordinate}
        pitch={pitch}
        heading={heading}
        animationMode="flyTo"
        animationDuration={2000}
      />

      {showUserLocation && (
        <MapboxGL.UserLocation
          animated={true}
          androidRenderMode="compass"
          showsUserHeadingIndicator={true}
        />
      )}

      {children}
    </MapboxGL.MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
});

export default CampusMap;
