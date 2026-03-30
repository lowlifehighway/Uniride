import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { THEME } from '../../../constants/themes';

const MapView = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>Map view is only available on mobile</Text>
      {children}
    </View>
  );
};

export const Camera = () => null;
export const UserLocation = () => null;
export const ShapeSource = () => null;
export const SymbolLayer = () => null;
export const LineLayer = () => null;
export const CircleLayer = () => null;
export const Images = () => null;
export const MarkerView = () => null;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
  },
});

export default MapView;
