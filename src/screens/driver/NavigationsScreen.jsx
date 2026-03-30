import { Feather } from '@expo/vector-icons';
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CampusMap from '../../components/Map/CampusMap';
import MapMarker from '../../components/Map/MapMarker';
import RouteLayer from '../../components/Map/RouteLayer';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const NavigationScreen = ({ route, navigation }) => {
  const { destination } = route.params || {};
  const destinationCoord = destination || [3.7221, 6.8935];
  const currentLocation = [3.7211, 6.8925];

  const handleOpenMaps = () => {
    const url = Platform.select({
      ios: `maps:?daddr=${destinationCoord[1]},${destinationCoord[0]}`,
      android: `google.navigation:q=${destinationCoord[1]},${destinationCoord[0]}`,
    });
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <CampusMap
        style={styles.map}
        centerCoordinate={currentLocation}
        zoomLevel={15}
        showUserLocation={true}
      >
        <RouteLayer coordinates={[currentLocation, destinationCoord]} />
        <MapMarker coordinate={destinationCoord} type="destination" />
      </CampusMap>

      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapsButton} onPress={handleOpenMaps}>
          <Feather name="navigation" size={20} color={COLORS.white} />
          <Text style={styles.mapsButtonText}>Open Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    gap: 8,
  },
  mapsButtonText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
  },
});

export default NavigationScreen;
