// screens/student/RideTrackingScreen.js
// Real-time driver location tracking with animated marker

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import CampusMap from '../../components/Map/CampusMap';
import MapMarker from '../../components/Map/MapMarker';
import RouteLayer from '../../components/Map/RouteLayer';
import { COLORS } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import CollapsibleBottomSheet from '../../components/CollapsibleBottomSheet';
import {
  getDirections,
  formatDistance,
  formatDuration,
} from '../../services/directions';
import { subscribeToDriverLocation } from '../../services/driverLocation';

const RideTrackingScreen = ({ navigation, route }) => {
  const { rideId } = route.params || {};

  const [rideData, setRideData] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverHeading, setDriverHeading] = useState(0);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);

  // Pulse animation for driver marker
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const routeFetchedRef = useRef(false);

  // Start pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const toLngLatArray = (location) => {
    if (!location) return null;
    return [location.longitude, location.latitude];
  };

  // ✅ Subscribe to ride document
  useEffect(() => {
    if (!rideId) {
      setError('No ride ID provided');
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('rides')
      .doc(rideId)
      .onSnapshot(
        (doc) => {
          if (!doc.exists) {
            setError('Ride not found');
            setLoading(false);
            return;
          }

          const data = { id: doc.id, ...doc.data() };
          setRideData(data);
          setLoading(false);

          // Fetch route once
          if (!routeFetchedRef.current && data.pickup && data.destination) {
            routeFetchedRef.current = true;
            fetchRoute(
              toLngLatArray(data.pickup),
              toLngLatArray(data.destination),
            );
          }

          if (data.status === 'completed') {
            handleRideCompleted(data);
          }
        },
        (err) => {
          setError('Failed to load ride');
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [rideId]);

  // ✅ Subscribe to driver info (name, vehicle, etc.)
  useEffect(() => {
    if (!rideData?.driverId) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(rideData.driverId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setDriverInfo({
            name:
              `${data.firstName || ''} ${data.lastName || ''}`.trim() ||
              'Driver',
            phone: data.phone || data.phoneNumber || null,
            rating: data.rating || 5.0,
            totalRatings: data.totalRatings || 0,
            vehicle: data.vehicleInfo
              ? `${data.vehicleInfo.make || ''} ${data.vehicleInfo.model || ''} • ${data.vehicleInfo.plate || ''}`.trim()
              : 'Vehicle',
            profilePic: data.profilePicture,
          });
          console.log(driverInfo);
        }
      });

    return () => unsubscribe();
  }, [rideData?.driverId]);

  // ✅ Subscribe to real-time driver location via driverLocation service
  useEffect(() => {
    if (!rideId || !rideData?.driverId) return;

    // Only track during active ride
    if (rideData?.status === 'completed' || rideData?.status === 'cancelled')
      return;

    console.log('👂 Starting real-time driver location tracking');

    const unsubscribe = subscribeToDriverLocation(rideId, (result) => {
      if (result.success && result.location) {
        const { coordinates, heading } = result.location;
        setDriverLocation(coordinates);
        setDriverHeading(heading || 0);
        setLastLocationUpdate(new Date());
        console.log('📍 Driver moved to:', coordinates);
      }
    });

    return () => {
      console.log('🔌 Stopping driver location subscription');
      unsubscribe();
    };
  }, [rideId, rideData?.driverId, rideData?.status]);

  const fetchRoute = async (pickup, destination) => {
    try {
      const result = await getDirections(pickup, destination, 'driving');
      if (result) setRouteData(result);
    } catch (err) {
      console.error('❌ Route fetch error:', err);
    }
  };

  const handleRideCompleted = (ride) => {
    setTimeout(() => {
      Alert.alert(
        'Ride Completed! 🎉',
        `Total fare: ₦${ride.fare || 0}\nThank you for riding with Uniride!`,
        [
          {
            text: 'Rate Driver',
            onPress: () =>
              navigation.replace('RateDriver', { rideId: ride.id }),
          },
          {
            text: 'Done',
            onPress: () =>
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] }),
          },
        ],
      );
    }, 1000);
  };

  const handleCallDriver = () => {
    const phone = driverInfo?.phone;
    if (!phone) {
      Alert.alert('Unavailable', 'Driver phone number not available');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Error', 'Cannot make calls on this device'),
    );
  };

  const handleCancelRide = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('rides').doc(rideId).update({
              status: 'cancelled',
              cancelledAt: firestore.FieldValue.serverTimestamp(),
              cancelledBy: 'student',
            });
            navigation.reset({
              index: 0,
              routes: [{ name: 'ServicesScreen' }],
            });
          } catch {
            Alert.alert('Error', 'Failed to cancel ride');
          }
        },
      },
    ]);
  };

  const getStatusDisplay = () => {
    switch (rideData?.status) {
      case 'accepted':
        return {
          text: 'Driver is on the way',
          color: COLORS.primary,
          icon: 'navigation',
        };
      case 'inProgress':
        return {
          text: "You're on your way!",
          color: COLORS.success,
          icon: 'zap',
        };
      case 'completed':
        return {
          text: 'Ride completed',
          color: COLORS.success,
          icon: 'check-circle',
        };
      default:
        return {
          text: 'Tracking ride...',
          color: COLORS.gray,
          icon: 'map-pin',
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  if (error || !rideData) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>{error || 'Ride not found'}</Text>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pickupCoords = toLngLatArray(rideData.pickup);
  const destinationCoords = toLngLatArray(rideData.destination);

  // Center map on driver if available, otherwise midpoint
  const centerCoordinate =
    driverLocation ||
    (pickupCoords && destinationCoords
      ? [
          (pickupCoords[0] + destinationCoords[0]) / 2,
          (pickupCoords[1] + destinationCoords[1]) / 2,
        ]
      : pickupCoords || [0, 0]);

  const statusDisplay = getStatusDisplay();
  const isActive =
    rideData.status !== 'completed' && rideData.status !== 'cancelled';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* ✅ Map with all markers */}
      <CampusMap
        style={styles.map}
        centerCoordinate={centerCoordinate}
        zoomLevel={driverLocation ? 15 : 14}
        showUserLocation={false}
      >
        {/* Route line */}
        {routeData?.coordinates && (
          <RouteLayer coordinates={routeData.coordinates} />
        )}

        {/* Pickup marker */}
        {pickupCoords && <MapMarker coordinate={pickupCoords} type="pickup" />}

        {/* Destination marker */}
        {destinationCoords && (
          <MapMarker coordinate={destinationCoords} type="destination" />
        )}

        {/* ✅ Animated driver marker - only show during active ride */}
        {driverLocation && isActive && (
          <MapMarker coordinate={driverLocation} type="custom">
            <View style={styles.driverMarkerWrapper}>
              {/* Pulse ring */}
              <Animated.View
                style={[
                  styles.driverMarkerPulse,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              {/* Driver icon */}
              <View style={styles.driverMarkerInner}>
                <Feather name="truck" size={18} color={COLORS.white} />
              </View>
            </View>
          </MapMarker>
        )}
      </CampusMap>

      {/* ✅ Live indicator badge (top right when tracking) */}
      {driverLocation && isActive && (
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
          {lastLocationUpdate && (
            <Text style={styles.liveTimestamp}> · just now</Text>
          )}
        </View>
      )}

      {/* Top controls */}
      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={24} color={COLORS.background} />
        </TouchableOpacity>

        {/* {driverInfo?.phone && (
          <TouchableOpacity style={styles.topButton} onPress={handleCallDriver}>
            <Feather name="phone" size={20} color={COLORS.background} />
          </TouchableOpacity>
        )} */}
      </SafeAreaView>

      {/* Bottom Sheet */}
      <CollapsibleBottomSheet
        isExpanded={isSheetExpanded}
        onToggle={setIsSheetExpanded}
        // collapsedHeight={120}
      >
        <View>
          {/* Status Banner */}
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: statusDisplay.color },
            ]}
          >
            <Feather name={statusDisplay.icon} size={20} color={COLORS.white} />
            <Text style={styles.statusText}>{statusDisplay.text}</Text>
          </View>

          {/* Driver Card */}
          {rideData.driverId && (
            <View style={styles.driverCard}>
              <Image
                source={{ uri: driverInfo?.profilePic }}
                style={styles.driverAvatar}
              />
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>
                  {driverInfo?.name || 'Loading driver info...'}
                </Text>
                <View style={styles.driverMeta}>
                  <Feather name="star" size={14} color={COLORS.warning} />
                  <Text style={styles.driverRating}>
                    {driverInfo?.rating?.toFixed(1) || '5.0'}
                  </Text>
                  {(driverInfo?.totalRatings || 0) > 0 && (
                    <Text style={styles.driverRatingCount}>
                      ({driverInfo.totalRatings})
                    </Text>
                  )}
                  <Text style={styles.driverSeparator}>•</Text>
                  <Text style={styles.driverVehicle} numberOfLines={1}>
                    {driverInfo?.vehicle || 'Loading...'}
                  </Text>
                </View>
              </View>
              {driverInfo?.phone && (
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={handleCallDriver}
                >
                  <Feather name="phone" size={20} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ✅ Driver location status */}
          {rideData.driverId && isActive && (
            <View style={styles.locationStatus}>
              <View
                style={[
                  styles.locationStatusDot,
                  {
                    backgroundColor: driverLocation
                      ? COLORS.success
                      : COLORS.gray,
                  },
                ]}
              />
              <Text style={styles.locationStatusText}>
                {driverLocation
                  ? `Driver location: live`
                  : 'Waiting for driver location...'}
              </Text>
            </View>
          )}

          {/* Route info */}
          <View style={styles.routeCard}>
            <View style={styles.routeItem}>
              <Feather
                name="circle"
                size={12}
                color={COLORS.primary}
                style={styles.routeIcon}
              />
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeText} numberOfLines={1}>
                  {rideData.pickup?.name || 'Pickup location'}
                </Text>
              </View>
            </View>
            <View style={styles.routeDivider} />
            <View style={styles.routeItem}>
              <Feather
                name="map-pin"
                size={12}
                color={COLORS.primary}
                style={styles.routeIcon}
              />
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Destination</Text>
                <Text style={styles.routeText} numberOfLines={1}>
                  {rideData.destination?.name || 'Destination'}
                </Text>
              </View>
            </View>
          </View>

          {/* Trip details */}
          <View style={styles.tripDetails}>
            <View style={styles.tripDetailItem}>
              <Feather name="navigation" size={16} color={COLORS.gray} />
              <Text style={styles.tripDetailText}>
                {formatDistance(rideData.distance || routeData?.distance || 0)}
              </Text>
            </View>
            <View style={styles.tripDetailItem}>
              <Feather name="clock" size={16} color={COLORS.gray} />
              <Text style={styles.tripDetailText}>
                {formatDuration(rideData.duration || routeData?.duration || 0)}
              </Text>
            </View>
            <View style={styles.tripDetailItem}>
              <Feather name="dollar-sign" size={16} color={COLORS.gray} />
              <Text style={styles.tripDetailText}>₦{rideData.fare || 0}</Text>
            </View>
          </View>

          {/* Passenger info */}
          {!rideData.isForSelf && rideData.passengerName && (
            <View style={styles.passengerCard}>
              <View style={styles.passengerHeader}>
                <Feather name="user-plus" size={16} color={COLORS.primary} />
                <Text style={styles.passengerLabel}>Riding for</Text>
              </View>
              <Text style={styles.passengerName}>{rideData.passengerName}</Text>
              {rideData.passengerPhone && (
                <Text style={styles.passengerPhone}>
                  {rideData.passengerPhone}
                </Text>
              )}
            </View>
          )}

          {/* Cancel */}
          {isActive && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelRide}
            >
              <Feather name="x-circle" size={18} color={'orange'} />
              <Text style={styles.cancelButtonText}>Cancel Ride</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 20 }} />
        </View>
      </CollapsibleBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: { color: COLORS.white, fontSize: 16, marginTop: 16 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 40,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  goBackButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  goBackButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ✅ Live indicator
  liveIndicator: {
    position: 'absolute',
    top: 100,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  liveText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  liveTimestamp: {
    color: COLORS.gray,
    fontSize: 11,
  },

  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topButton: {
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

  // ✅ Animated driver marker
  driverMarkerWrapper: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverMarkerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '40',
  },
  driverMarkerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },

  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  driverAvatar: {
    width: 75,
    height: 75,
    borderRadius: 75,
    // backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: { flex: 1 },
  driverName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  driverMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  driverRating: { color: COLORS.white, fontSize: 14 },
  driverRatingCount: { color: COLORS.gray, fontSize: 12 },
  driverSeparator: { color: COLORS.gray, fontSize: 14 },
  driverVehicle: { color: COLORS.gray, fontSize: 13, flex: 1 },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ✅ Location status
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  locationStatusDot: { width: 8, height: 8, borderRadius: 4 },
  locationStatusText: { color: COLORS.gray, fontSize: 12 },

  routeCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  routeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  routeIcon: { marginTop: 2, width: 14 },
  routeTextContainer: { flex: 1 },
  routeLabel: { color: COLORS.gray, fontSize: 12, marginBottom: 2 },
  routeText: { color: COLORS.white, fontSize: 15 },
  routeDivider: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.gray,
    marginLeft: 5,
    marginVertical: 8,
  },

  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tripDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tripDetailText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },

  passengerCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  passengerLabel: {
    color: COLORS.gray,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  passengerName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  passengerPhone: { color: COLORS.gray, fontSize: 14 },

  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: COLORS.darkGray,
  },
  cancelButtonText: { color: 'orange', fontSize: 16, fontWeight: '600' },
});

export default RideTrackingScreen;
