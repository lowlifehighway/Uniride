// screens/student/DriverMatchScreen.js - Complete with proper data forwarding

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import CampusMap from '../../components/Map/CampusMap';
import MapMarker from '../../components/Map/MapMarker';
import DriverCard from '../../components/Cards/DriverCard';
import CollapsibleBottomSheet from '../../components/CollapsibleBottomSheet';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import Firebase service
import {
  subscribeToRideMatch,
  cancelRideRequest,
} from '../../services/studentRides';

const DriverMatchScreen = ({ navigation, route }) => {
  const {
    rideId,
    rideType,
    paymentMethod,
    routeData,
    pickup,
    destination,
    pickupName,
    destinationName,
    passenger,
    isForSelf,
  } = route.params || {};

  const [currentDriver, setCurrentDriver] = useState(null);
  const [matchedRide, setMatchedRide] = useState(null);
  const [driverFound, setDriverFound] = useState(false);
  const [searching, setSearching] = useState(true);
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);

  const destinationCoord = destination || [3.7221, 6.8935];
  const pickupCoord = pickup || [3.7211, 6.8925];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const unsubscribeRef = useRef(null);

  // ✅ Log received params for debugging
  useEffect(() => {
    console.log('📥 DriverMatch received params:', {
      rideId,
      pickup,
      destination,
      pickupName,
      destinationName,
      hasRouteData: !!routeData,
      passenger: passenger?.name,
    });
  }, []);

  // ✅ LISTEN FOR DRIVER MATCH
  useEffect(() => {
    if (!rideId) {
      Alert.alert('Error', 'Invalid ride request');
      navigation.goBack();
      return;
    }

    console.log('🔍 Listening for driver match on ride:', rideId);

    const unsubscribe = subscribeToRideMatch(rideId, (result) => {
      if (result.success) {
        // ✅ Check if ride was cancelled
        if (result.ride?.status === 'cancelled') {
          console.log('🚫 Ride was cancelled, stopping search');
          setSearching(false);
          return;
        }

        if (result.matched) {
          console.log('✅ Driver matched:', result.driver);

          // ✅ Store the complete matched ride data
          setMatchedRide(result.ride);

          // ✅ Format driver data for DriverCard
          setCurrentDriver({
            name: result.driver.name,
            vehicle: result.driver.vehicle,
            distance: '2 km',
            time: '2-3 mins',
            charge: rideType === 'express' ? '₦300' : '₦600',
            rating: result.driver.rating || 5.0,
            phone: result.driver.phone,
            profilePic: result.driver.profilePic,
          });
          setDriverFound(true);
          setSearching(false);

          // Auto-expand when driver found
          setIsSheetExpanded(true);
        } else {
          console.log('⏳ Still searching for driver...');
          setSearching(true);
        }
      } else {
        console.error('❌ Error in driver match:', result.error);
        Alert.alert('Error', 'Failed to find driver. Please try again.');
      }
    });

    // Store unsubscribe function
    unsubscribeRef.current = unsubscribe;

    return () => {
      console.log('🔌 Unsubscribing from driver match');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [rideId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Ride?',
      'Are you sure you want to cancel this ride request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            console.log('🚫 Cancelling ride:', rideId);

            // Stop listening immediately
            if (unsubscribeRef.current) {
              unsubscribeRef.current();
              unsubscribeRef.current = null;
            }

            setSearching(false);

            const result = await cancelRideRequest(rideId, 'Changed my mind');

            if (result.success) {
              console.log('✅ Ride cancelled successfully');
              navigation.navigate('ServicesScreen');
            } else {
              console.error('❌ Error cancelling ride:', result.error);
              Alert.alert('Error', 'Failed to cancel ride');
            }
          },
        },
      ],
    );
  };

  const handleTrackRide = () => {
    if (!currentDriver || !rideId) {
      Alert.alert('Error', 'Unable to start tracking');
      return;
    }

    console.log('📤 Navigating to RideTracking with rideId:', rideId);

    // ✅ OPTION 1: Just pass rideId (recommended)
    // RideTrackingScreen will fetch everything from Firestore
    navigation.replace('RideTracking', {
      rideId: rideId,
    });

    /* 
    // ✅ OPTION 2: Pass all data (backup/legacy support)
    // Uncomment this if you want to pass data AND fetch from Firestore
    navigation.replace('RideTracking', {
      rideId: rideId,
      
      // Driver info
      driver: currentDriver,
      driverId: matchedRide?.driverId,
      
      // ✅ Forward coordinates from route.params
      pickup: pickup || [
        matchedRide?.pickup?.longitude,
        matchedRide?.pickup?.latitude,
      ],
      destination: destination || [
        matchedRide?.destination?.longitude,
        matchedRide?.destination?.latitude,
      ],
      
      // ✅ Forward location names
      pickupName: pickupName || matchedRide?.pickup?.name || 'Pickup Location',
      destinationName: destinationName || matchedRide?.destination?.name || 'Destination',
      
      // ✅ Forward route data
      routeData: routeData || {
        distance: matchedRide?.distance || 0,
        duration: matchedRide?.duration || 0,
      },
      
      // Ride details
      rideType: rideType || matchedRide?.rideType,
      paymentMethod: paymentMethod || matchedRide?.paymentMethod,
      fare: matchedRide?.fare,
      
      // ✅ Passenger data
      passenger: passenger || {
        name: matchedRide?.passengerName,
        phone: matchedRide?.passengerPhone,
        relationship: matchedRide?.passengerRelationship,
      },
      isForSelf: isForSelf !== undefined ? isForSelf : matchedRide?.isForSelf,
    });
    */
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webContainer}>
          <Feather name="search" size={64} color={COLORS.gray} />
          <Text style={styles.webText}>
            Driver matching is only available on mobile
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

      {/* Map */}
      <CampusMap
        style={styles.map}
        centerCoordinate={destinationCoord}
        zoomLevel={15}
        showUserLocation={false}
      >
        <MapMarker coordinate={destinationCoord} type="custom">
          <View style={styles.checkmarkContainer}>
            <Feather name="check" size={24} color={COLORS.white} />
          </View>
        </MapMarker>
      </CampusMap>

      {/* Top Bar */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity onPress={handleCancel}>
          <View style={styles.profileButton}>
            <Feather name="chevron-left" size={24} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Sheet with CollapsibleBottomSheet */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <CollapsibleBottomSheet
          isExpanded={isSheetExpanded}
          onToggle={setIsSheetExpanded}
        >
          <View style={styles.sheetContent}>
            {/* Status Header */}
            <View style={styles.statusContainer}>
              <View style={styles.statusDot}>
                {driverFound ? (
                  <Feather name="check" size={16} color={COLORS.white} />
                ) : (
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    }}
                  >
                    <Feather name="loader" size={16} color={COLORS.white} />
                  </Animated.View>
                )}
              </View>
              <Text style={styles.statusText}>
                {driverFound ? 'Driver found!' : 'Finding driver...'}
              </Text>
            </View>

            {/* Driver Card (when found) */}
            {currentDriver && <DriverCard {...currentDriver} />}

            {/* Searching State */}
            {!currentDriver && searching && (
              <View style={styles.searchingContainer}>
                <Text style={styles.searchingText}>
                  Searching for available drivers nearby...
                </Text>
                <Text style={styles.searchingSubtext}>
                  This usually takes 10-30 seconds
                </Text>
              </View>
            )}

            {/* Track Ride Button */}
            {driverFound && currentDriver && (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleTrackRide}
              >
                <Text style={styles.confirmButtonText}>Track ride</Text>
                <Feather
                  name="arrow-right"
                  size={20}
                  color={COLORS.background}
                />
              </TouchableOpacity>
            )}

            {/* Cancel Button */}
            {searching && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel Request</Text>
              </TouchableOpacity>
            )}
          </View>
        </CollapsibleBottomSheet>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { flex: 1 },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  webText: {
    color: COLORS.white,
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkmarkContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sheetContent: {
    paddingTop: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statusDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  searchingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  searchingText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  searchingSubtext: {
    color: COLORS.gray,
    fontSize: 14,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  confirmButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: COLORS.darkGray,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DriverMatchScreen;
