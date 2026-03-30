import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Keyboard,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { getAllLocations, searchLocations } from '../../config/mapbox';

const LocationPickerModal = ({
  visible,
  onClose,
  onSelect,
  title = 'Select Location',
  currentLocation = null,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentGPS, setCurrentGPS] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const slideAnim = useState(new Animated.Value(1000))[0];

  // Memoized data
  const allLocations = useMemo(() => getAllLocations(), []);

  // Animation
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setFilteredLocations(allLocations);

      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(1000);
    }
  }, [visible]);

  // Request location permission
  useEffect(() => {
    if (visible) {
      requestLocationPermission();
    }
  }, [visible]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentGPS({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationPermission(false);
    }
  };

  // Search handler
  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(true);

    setTimeout(() => {
      const results = query ? searchLocations(query) : allLocations;
      setFilteredLocations(results);
      setIsSearching(false);
    }, 200);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredLocations(allLocations);
    Keyboard.dismiss();
  };

  const handleSelectLocation = useCallback(
    (location) => {
      onSelect(location);
      clearSearch();

      // Animate out
      Animated.timing(slideAnim, {
        toValue: 1000,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    },
    [onSelect, onClose, slideAnim],
  );

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleCurrentLocation = useCallback(async () => {
    if (!locationPermission) {
      await requestLocationPermission();
      return;
    }
    if (currentGPS) {
      handleSelectLocation({
        id: 'current',
        name: 'Current Location',
        fullName: 'Your Current Location',
        coordinates: [currentGPS.longitude, currentGPS.latitude],
        address: 'GPS Location',
        type: 'current',
      });
    } else {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 10000,
        });

        handleSelectLocation({
          id: 'current',
          name: 'Current Location',
          fullName: 'Your Current Location',
          coordinates: [location.coords.longitude, location.coords.latitude],
          address: 'GPS Location',
          type: 'current',
        });
      } catch (error) {
        console.error('Error getting current location:', error);
        alert('Unable to get your current location. Please try again.');
      }
    }
  }, [locationPermission, currentGPS, handleSelectLocation]);

  const getLocationIcon = useCallback((type) => {
    const iconMap = {
      pickup: 'map-pin',
      hostel: 'home',
      landmark: 'star',
      food: 'coffee',
      service: 'activity',
      recreation: 'award',
      academic: 'book',
      admin: 'briefcase',
      current: 'navigation',
      default: 'map-pin',
    };
    return iconMap[type] || iconMap.default;
  }, []);

  const getLocationIconColor = useCallback((type) => {
    const colorMap = {
      pickup: COLORS.primary,
      hostel: '#4CAF50',
      landmark: '#FF9800',
      food: '#E91E63',
      service: '#2196F3',
      recreation: '#9C27B0',
      academic: '#009688',
      admin: '#795548',
      current: COLORS.primary,
      default: COLORS.primary,
    };
    return colorMap[type] || colorMap.default;
  }, []);

  const renderLocationItem = useCallback(
    ({ item, index }) => {
      const isCurrent = currentLocation?.id === item.id;

      return (
        <TouchableOpacity
          style={[styles.locationItem, isCurrent && styles.currentLocationItem]}
          onPress={() => handleSelectLocation(item)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.locationIcon,
              { backgroundColor: `${getLocationIconColor(item.type)}20` },
            ]}
          >
            <Feather
              name={getLocationIcon(item.type)}
              size={22}
              color={getLocationIconColor(item.type)}
            />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.locationAddress} numberOfLines={2}>
              {item.address}
            </Text>
          </View>
          <View style={styles.locationActions}>
            <Feather
              name={isCurrent ? 'check-circle' : 'chevron-right'}
              size={22}
              color={isCurrent ? COLORS.primary : COLORS.gray}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [
      currentLocation,
      getLocationIcon,
      getLocationIconColor,
      handleSelectLocation,
    ],
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {!searchQuery && (
        <View style={styles.sectionHeader}>
          <Feather name="map" size={16} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>
            {filteredLocations.length} locations available
          </Text>
        </View>
      )}

      {searchQuery && (
        <View style={styles.sectionHeader}>
          <Feather name="search" size={16} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>
            {filteredLocations.length} result
            {filteredLocations.length !== 1 ? 's' : ''} for "{searchQuery}"
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="map-pin" size={64} color={COLORS.gray} />
      <Text style={styles.emptyText}>No locations found</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery ? 'Try a different search term' : 'No locations available'}
      </Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={handleCurrentLocation}
        activeOpacity={0.8}
      >
        <View style={styles.currentLocationIcon}>
          <Feather
            name={locationPermission ? 'navigation' : 'map-pin'}
            size={20}
            color={COLORS.background}
          />
        </View>
        <View style={styles.currentLocationTextContainer}>
          <Text style={styles.currentLocationTitle}>
            {locationPermission
              ? 'Use Current Location'
              : 'Enable Location Services'}
          </Text>
          <Text style={styles.currentLocationSubtitle}>
            {locationPermission
              ? 'Use your GPS location'
              : 'Tap to enable location access'}
          </Text>
        </View>
        {locationPermission === null && (
          <ActivityIndicator size="small" color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      transparent={true}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="chevron-left" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.headerRight} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color={COLORS.gray} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search locations..."
                placeholderTextColor={COLORS.gray}
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="words"
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={clearSearch}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x-circle" size={20} color={COLORS.gray} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Results List */}
          <FlatList
            data={filteredLocations}
            renderItem={renderLocationItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={!isSearching && renderEmptyState()}
            ListFooterComponent={renderFooter}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
          />

          {isSearching && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 16,
  },
  headerRight: {
    width: 32,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: COLORS.darkGray,
    borderRadius: THEME.borderRadius.large,
    borderColor: COLORS.darkGray,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
  },
  headerSection: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGray,
    borderBottomColor: COLORS.darkGray,
  },
  currentLocationItem: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
    marginRight: 12,
  },
  locationName: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
    lineHeight: 18,
  },
  locationActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.md,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 16,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
  },
  currentLocationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationTextContainer: {
    flex: 1,
  },
  currentLocationTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentLocationSubtitle: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    marginTop: 12,
  },
});

export default LocationPickerModal;
