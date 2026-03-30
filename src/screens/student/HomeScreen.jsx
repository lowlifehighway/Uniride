import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SearchBar from '../../components/Inputs/SearchBar';
import SavedLocation from '../../components/SavedLocation';
import SuggestionCard from '../../components/Cards/SuggestionCard';
import PromoCard from '../../components/Cards/PromoCard';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { findClosestLocation } from '../../utils/locationsDistance';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToStudentActiveRide } from '../../services/activeRide';
import ActiveRideBanner from '../../components/Cards/ActiveRideBanner';
import logo from '../../../assets/icon.png';

const HomeScreen = ({ navigation }) => {
  const suggestions = [
    { id: '1', icon: 'navigation', label: 'rides' },
    { id: '2', icon: 'package', label: 'Packages' },
    { id: '3', icon: 'calendar', label: 'Reserve' },
  ];
  const { user } = useAuth();
  const [activeRide, setActiveRide] = useState(null);
  const [currentGPS, setCurrentGPS] = useState(null);
  const [closestLocation, setClosestLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        setLocationLoading(true);

        // Request permission first
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Location permission denied');
          setLocationLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 10000, // 10 seconds timeout
        });

        const userLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setCurrentGPS(userLocation);

        // Find closest location
        const closest = findClosestLocation(userLocation);
        setClosestLocation(closest);
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Unable to get your location');
      } finally {
        setLocationLoading(false);
      }
    };
    getLocation();
  }, []);
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToStudentActiveRide(user.uid, (result) => {
      if (result.success) {
        setActiveRide(result.data);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);
  console.log('active ride', activeRide?.id);

  const handleActiveRidePress = () => {
    if (!activeRide) return;

    switch (activeRide.status) {
      case 'pending':
        // ✅ Go to DriverMatch - only needs rideId
        navigation.navigate('DriverMatch', { rideId: activeRide.id });
        break;

      case 'accepted':
        // ✅ Go to DriverMatch - driver found, waiting for student to track
        navigation.navigate('DriverMatch', { rideId: activeRide.id });
        break;

      case 'inProgress':
        // ✅ Go to RideTracking - only needs rideId
        navigation.navigate('RideTracking', { rideId: activeRide.id });
        break;

      default:
        console.log('Unknown ride status:', activeRide.status);
    }
  };

  // Function to refresh location
  const refreshLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentGPS(userLocation);

      const closest = findClosestLocation(userLocation);
      setClosestLocation(closest);
    } catch (error) {
      console.error('Error refreshing location:', error);
      setLocationError('Failed to refresh location');
    } finally {
      setLocationLoading(false);
    }
  };

  // Function to get display text for location
  const getLocationDisplayText = () => {
    if (locationLoading) {
      return 'Getting location...';
    }

    if (locationError) {
      return locationError;
    }

    if (closestLocation) {
      return (
        closestLocation.name || closestLocation.fullName || 'Unknown location'
      );
    }

    return "Can't fetch location";
  };

  // Function to get distance text
  const getDistanceText = () => {
    if (closestLocation && closestLocation.distanceFormatted) {
      return ` (${closestLocation.distanceFormatted} away)`;
    }
    return '';
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={locationLoading}
              onRefresh={refreshLocation}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={20} color={COLORS.white} />
              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>
                  {getLocationDisplayText()}
                </Text>
                {closestLocation && (
                  <Text style={styles.distanceText}>{getDistanceText()}</Text>
                )}
              </View>
              {/* <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshLocation}
                disabled={locationLoading}
              >
                <Feather
                  name="refresh-cw"
                  size={16}
                  color={locationLoading ? COLORS.gray : COLORS.white}
                />
              </TouchableOpacity> */}
            </View>
            {/* {locationLoading && (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={styles.loadingIndicator}
              />
            )} */}
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>Uniride</Text>
              <Image source={logo} style={styles.logoIcon} />
            </View>
          </View>
          {/* Search Bar */}
          <SearchBar
            onPress={() => navigation.navigate('RidePlan', { mode: 'ride' })}
            onSchedulePress={() => console.log('Schedule pressed')}
          />
          {/* Saved Location - You can use the closest location here too */}
          {!activeRide ? (
            <SavedLocation
              title={
                closestLocation
                  ? closestLocation.fullName
                  : 'No location detected'
              }
              address={
                closestLocation
                  ? closestLocation.address
                  : 'Fetching address...'
              }
              onPress={() => {
                if (closestLocation) {
                  console.log('Closest location pressed:', closestLocation);
                  // You could navigate to a map view showing this location
                  // navigation.navigate('Map', { location: closestLocation });
                }
              }}
            />
          ) : (
            <ActiveRideBanner
              ride={activeRide}
              userRole="student"
              onPress={handleActiveRidePress}
            />
          )}
          {/* Suggestions Header */}
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>Suggestions</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ServicesScreen', {
                  screen: 'ServicesScreen',
                })
              }
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          {/* Suggestions Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsScroll}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestions.map((item) => (
              <TouchableOpacity key={item.id}>
                <SuggestionCard
                  icon={item.icon}
                  label={item.label}
                  onPress={() => {
                    if (item.label === 'Packages') {
                      navigation.navigate('RidePlan', { mode: 'courier' });
                    } else {
                      navigation.navigate('RidePlan', { mode: 'ride' });
                    }
                    console.log(`${item.label} pressed`);
                  }}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Promo Card */}
          <PromoCard
            title="Enjoy 40% off select rides"
            buttonText="book now"
            onPress={() => {
              console.log('Promo pressed');
              navigation.navigate('Promotion');
            }}
          />
          {/* Debug info - remove in production */}
          {__DEV__ && currentGPS && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>
                GPS: {currentGPS.latitude.toFixed(6)},{' '}
                {currentGPS.longitude.toFixed(6)}
              </Text>
              {closestLocation && (
                <Text style={styles.debugText}>
                  Closest: {closestLocation.name} -{' '}
                  {closestLocation.distanceFormatted}
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flex: 1,
    marginLeft: 8,
  },
  locationText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
  },
  distanceText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
    marginTop: 2,
  },
  refreshButton: {
    padding: 4,
    marginLeft: 8,
  },
  loadingIndicator: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  logoText: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.xxxl,
    fontWeight: 'bold',
    marginRight: 8,
  },
  logoIcon: {
    // fontSize: 28,
    width: 28,
    height: 28,
    // tintColor: COLORS.primary,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  suggestionsTitle: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
  },
  suggestionsScroll: {
    marginBottom: 20,
  },
  suggestionsContent: {
    paddingHorizontal: 20,
  },
  // Debug styles - remove in production
  debugInfo: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  debugText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
    fontFamily: 'monospace',
  },
});

export default HomeScreen;
