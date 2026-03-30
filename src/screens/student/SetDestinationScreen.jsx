import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import CampusMap from '../../components/Map/CampusMap';
import MapMarker from '../../components/Map/MapMarker';
import { getCurrentLocation } from '../../utils/permissions';
import { CAMPUS_CENTER } from '../../config/mapbox';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const SetDestinationScreen = ({ navigation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      const coords = [location.longitude, location.latitude];
      setUserLocation(coords);
      setSelectedLocation(coords);
    } else {
      // Use campus center as default
      const defaultCoords = [CAMPUS_CENTER.longitude, CAMPUS_CENTER.latitude];
      setSelectedLocation(defaultCoords);
    }
  };

  const handleMapPress = (event) => {
    const { geometry } = event;
    setSelectedLocation(geometry.coordinates);
  };

  const handleSearchDestination = () => {
    if (selectedLocation) {
      navigation.navigate('PickupConfirmation', {
        pickup: userLocation || [
          CAMPUS_CENTER.longitude,
          CAMPUS_CENTER.latitude,
        ],
        destination: selectedLocation,
      });
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webContainer}>
          <Feather name="map" size={64} color={COLORS.gray} />
          <Text style={styles.webText}>
            Map view is only available on mobile
          </Text>
          <TouchableOpacity
            style={styles.webButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.webButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <CampusMap
        style={styles.map}
        centerCoordinate={
          selectedLocation || [CAMPUS_CENTER.longitude, CAMPUS_CENTER.latitude]
        }
        zoomLevel={16}
        onPress={handleMapPress}
        showUserLocation={true}
      >
        {selectedLocation && (
          <MapMarker coordinate={selectedLocation} type="destination" />
        )}
      </CampusMap>

      {/* Top Controls */}
      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={28} color={COLORS.background} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>Set your destination</Text>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destination"
            placeholderTextColor={COLORS.gray}
          />
          <Feather name="search" size={20} color={COLORS.gray} />
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchDestination}
        >
          <Text style={styles.searchButtonText}>Confirm destination</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  webText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  webButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  webButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 30,
  },
  sheetTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  searchButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
  },
});

export default SetDestinationScreen;
