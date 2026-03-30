import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const MapMarker = ({ coordinate, type = 'default', onPress, children }) => {
  const renderMarker = () => {
    switch (type) {
      case 'pickup':
        return (
          <View style={styles.pickupMarker}>
            <Feather name="circle" size={16} color={COLORS.primary} />
          </View>
        );

      case 'destination':
        return (
          <View style={styles.destinationMarker}>
            <Feather name="map-pin" size={24} color={COLORS.primary} />
          </View>
        );

      case 'driver':
        return (
          <View style={styles.driverMarker}>
            <View style={styles.driverMarkerInner}>
              <Feather name="navigation" size={16} color={COLORS.white} />
            </View>
          </View>
        );

      case 'custom':
        return children;

      default:
        return (
          <View style={styles.defaultMarker}>
            <Feather name="map-pin" size={20} color={COLORS.white} />
          </View>
        );
    }
  };

  return (
    <MapboxGL.MarkerView
      id={`marker-${type}-${coordinate[0]}-${coordinate[1]}`}
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View onTouchEnd={onPress}>{renderMarker()}</View>
    </MapboxGL.MarkerView>
  );
};

const styles = StyleSheet.create({
  defaultMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationMarker: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  driverMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapMarker;
