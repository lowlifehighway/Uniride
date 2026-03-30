import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';
import CampusMap from '../../components/Map/CampusMap';
import MapMarker from '../../components/Map/MapMarker';
import RouteLayer from '../../components/Map/RouteLayer';
import CollapsibleBottomSheet from '../../components/CollapsibleBottomSheet';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import {
  getDirections,
  formatDistance,
  formatDuration,
} from '../../services/directions';
import {
  startLocationTracking,
  stopLocationTracking,
} from '../../services/driverLocation';

// ✅ Import Firebase services
import {
  startRide,
  completeRide,
  subscribeToActiveRide,
} from '../../services/rides';

const ActiveRideScreen = ({ route, navigation }) => {
  const { ride: initialRide } = route.params || {};
  const toast = useToast();
  const { user } = useAuth();

  // State
  const [ride, setRide] = useState(initialRide);
  const [distance, setDistance] = useState('2.3 km');
  const [duration, setDuration] = useState('5 mins');
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ ADDED: Missing state variable

  // Map coordinates
  const pickup = ride?.pickup
    ? [ride.pickup.longitude, ride.pickup.latitude]
    : [3.7211, 6.8925];
  const destination = ride?.destination
    ? [ride.destination.longitude, ride.destination.latitude]
    : [3.7221, 6.8935];
  const [currentLocation, setCurrentLocation] = useState(pickup);
  const [routeData, setRouteData] = useState(null);

  // ✅ Subscribe to real-time ride updates
  useEffect(() => {
    if (!ride?.id) return;

    console.log('📡 Subscribing to ride updates:', ride.id);
    const unsubscribe = subscribeToActiveRide(ride.id, (result) => {
      if (result.success && result.data) {
        console.log('✅ Ride updated:', result.data.status);
        setRide(result.data);

        // If ride is completed, navigate away
        if (result.data.status === 'completed') {
          toast.success('Ride completed!');
          navigation.navigate('RideComplete', {
            ride: result.data,
            fare: result.data.fare,
          });
        }
      }
    });

    return () => {
      console.log('🔌 Unsubscribing from ride updates');
      unsubscribe();
    };
  }, [ride?.id]);
  useEffect(() => {
    if (!ride.id || !user?.uid) return;

    const beginTracking = async () => {
      const result = await startLocationTracking(user.uid, ride.id);
      if (result.success) {
        console.log('✅ Driver location tracking started');
      } else {
        console.error('❌ Tracking failed:', result.error);
      }
    };

    beginTracking();

    // ✅ Stop tracking when screen unmounts or ride ends
    return () => {
      stopLocationTracking();
    };
  }, [ride.id, user?.uid]);
  // Determine ride status from Firebase
  const getRideStatus = () => {
    if (!ride?.status) return 'pickup';

    switch (ride.status) {
      case 'accepted':
        return 'pickup';
      case 'inProgress':
        return 'inProgress';
      case 'completed':
        return 'dropoff';
      default:
        return 'pickup';
    }
  };

  const rideStatus = getRideStatus();

  // ✅ Fetch route on mount
  useEffect(() => {
    fetchRoute();
  }, []);

  const fetchRoute = async () => {
    setLoading(true);
    const data = await getDirections(pickup, destination, 'driving');

    if (data) {
      setRouteData(data);
      setDistance(formatDistance(data.distance));
      setDuration(formatDuration(data.duration));
      console.log(
        '✅ Route loaded:',
        formatDistance(data.distance),
        formatDuration(data.duration),
      );
    } else {
      setRouteData({
        coordinates: [pickup, destination],
        distance: 3200,
        duration: 480,
      });
    }
    setLoading(false);
  };

  const handleCall = () => {
    const phoneNumber = ride?.passengerPhone || '+2349012345678';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = () => {
    toast.info('Chat feature coming soon');
  };

  const handleNavigation = () => {
    const coords = rideStatus === 'pickup' ? pickup : destination;
    const url = Platform.select({
      ios: `maps:?daddr=${coords[1]},${coords[0]}`,
      android: `google.navigation:q=${coords[1]},${coords[0]}`,
    });
    Linking.openURL(url);
  };

  // ✅ Start ride (Firebase update)
  const handleStartRide = async () => {
    if (updating) return;

    Alert.alert('Start Ride', 'Confirm that the student has boarded?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: async () => {
          setUpdating(true);

          const result = await startRide(ride.id);

          if (result.success) {
            console.log('✅ Ride started in Firebase');
            toast.success('Ride started!');
          } else {
            console.error('❌ Error starting ride:', result.error);
            toast.error('Failed to start ride');
          }

          setUpdating(false);
        },
      },
    ]);
  };

  // ✅ Complete ride (Firebase update)
  const handleCompleteRide = async () => {
    if (updating) return;

    Alert.alert(
      'Complete Ride',
      `Confirm ride completion?\n\nFare: ₦${ride?.fare || 300}\nYour Earnings: ₦${Math.round((ride?.fare || 300) * 0.85)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setUpdating(true);

            // ✅ FIXED: Pass user.uid as driverId
            const result = await completeRide(ride.id, user.uid);
            await stopLocationTracking();

            if (result.success) {
              console.log('✅ Ride completed in Firebase');
              console.log('💰 Earnings:', result.data.earnings);

              toast.success(`Earned ₦${result.data.earnings}!`);

              navigation.navigate('RideComplete', {
                ride: result.data.ride,
                fare: result.data.ride.fare,
                earnings: result.data.earnings,
              });
            } else {
              console.error('❌ Error completing ride:', result.error);
              toast.error('Failed to complete ride');
            }

            setUpdating(false);
          },
        },
      ],
    );
  };

  const handleEmergency = () => {
    Alert.alert('Emergency', 'Call emergency services?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => Linking.openURL('tel:911'),
        style: 'destructive',
      },
    ]);
  };

  const getStatusText = () => {
    switch (rideStatus) {
      case 'pickup':
        return 'Heading to pickup';
      case 'inProgress':
        return 'En route to destination';
      case 'dropoff':
        return 'Arrived at destination';
      default:
        return 'Active ride';
    }
  };

  const getActionButtonText = () => {
    if (updating) return 'Updating...';

    switch (rideStatus) {
      case 'pickup':
        return 'Start Ride';
      case 'inProgress':
        return 'Complete Ride';
      case 'dropoff':
        return 'Complete Ride';
      default:
        return 'Continue';
    }
  };

  const handleActionButton = () => {
    if (rideStatus === 'pickup') {
      handleStartRide();
    } else {
      handleCompleteRide();
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.webText}>Map view only available on mobile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Map */}
      <CampusMap
        style={styles.map}
        centerCoordinate={currentLocation}
        zoomLevel={15}
        showUserLocation={true}
      >
        <RouteLayer
          coordinates={routeData?.coordinates || [pickup, destination]}
        />
        {rideStatus === 'pickup' && (
          <MapMarker coordinate={pickup} type="pickup" />
        )}
        <MapMarker coordinate={destination} type="destination" />
      </CampusMap>

      {/* Top Controls */}
      <SafeAreaView style={styles.topControls} edges={['top']}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={handleEmergency}
          >
            <Feather name="alert-circle" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleNavigation}
          >
            <Feather name="navigation" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Status Banner */}
      <View style={styles.statusBanner}>
        <View style={styles.statusIndicator}>
          <Feather name="navigation" size={16} color={COLORS.white} />
        </View>
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          <View style={styles.distanceContainer}>
            <Feather name="map-pin" size={12} color={COLORS.gray} />
            <Text style={styles.distanceText}>
              {distance} • {duration}
            </Text>
          </View>
        </View>
      </View>

      {/* Collapsible Bottom Sheet */}
      <CollapsibleBottomSheet
        isExpanded={isSheetExpanded}
        onToggle={setIsSheetExpanded}
        collapsedHeight={150}
      >
        <View style={styles.sheetContent}>
          {/* Student Info */}
          <View style={styles.studentSection}>
            <View style={styles.studentInfo}>
              <View style={styles.avatar}>
                <Feather name="user" size={24} color={COLORS.gray} />
              </View>
              <View style={styles.studentDetails}>
                <Text style={styles.studentName}>
                  {ride?.passengerName || 'Student'}
                </Text>
                <View style={styles.ratingContainer}>
                  <Feather name="star" size={14} color={COLORS.warning} />
                  <Text style={styles.rating}>
                    {ride?.studentRating || '4.5'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleCall}
              >
                <Feather name="phone" size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleMessage}
              >
                <Feather name="message-circle" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Route Info */}
          <View style={styles.routeInfo}>
            <View style={styles.routeItem}>
              <View style={styles.routeDot}>
                <Feather
                  name={rideStatus === 'pickup' ? 'circle' : 'check-circle'}
                  size={14}
                  color={
                    rideStatus === 'pickup' ? COLORS.primary : COLORS.success
                  }
                />
              </View>
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {ride?.pickup?.name || 'BuCodel Building'}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routeItem}>
              <View style={styles.routeDot}>
                <Feather
                  name="map-pin"
                  size={14}
                  color={
                    rideStatus === 'dropoff' ? COLORS.success : COLORS.primary
                  }
                />
              </View>
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Destination</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {ride?.destination?.name || 'Emerald Hall'}
                </Text>
              </View>
            </View>
          </View>

          {/* Fare Info */}
          <View style={styles.fareCard}>
            <View style={styles.fareItem}>
              <Text style={styles.fareLabel}>Ride Type</Text>
              <Text style={styles.fareValue}>
                {ride?.rideType === 'private' ? 'Private' : 'Express'}
              </Text>
            </View>
            <View style={styles.fareDivider} />
            <View style={styles.fareItem}>
              <Text style={styles.fareLabel}>Fare</Text>
              <Text style={styles.fareValueAmount}>₦{ride?.fare || 300}</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              updating && styles.actionButtonDisabled,
            ]}
            onPress={handleActionButton}
            disabled={updating}
          >
            <Text style={styles.actionButtonText}>{getActionButtonText()}</Text>
            {!updating && (
              <Feather
                name={rideStatus === 'pickup' ? 'play' : 'check'}
                size={20}
                color={COLORS.white}
              />
            )}
          </TouchableOpacity>
        </View>
      </CollapsibleBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { flex: 1 },
  webText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 100,
    fontSize: THEME.fontSize.lg,
    color: COLORS.gray,
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActions: { flexDirection: 'row', gap: 12 },
  emergencyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBanner: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 10,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTextContainer: { flex: 1 },
  statusText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  distanceText: { fontSize: THEME.fontSize.xs, color: COLORS.gray },
  sheetContent: {
    paddingTop: 10,
  },
  studentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentDetails: { flex: 1 },
  studentName: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: THEME.fontSize.sm, color: COLORS.white },
  contactButtons: { flexDirection: 'row', gap: 12 },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfo: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  routeItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeDot: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
    marginLeft: 11,
    marginVertical: 4,
  },
  routeTextContainer: { flex: 1 },
  routeLabel: {
    fontSize: THEME.fontSize.xs,
    color: COLORS.white,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: THEME.fontSize.md,
    color: COLORS.white,
    fontWeight: '500',
  },
  fareCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.grayLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fareItem: { flex: 1, alignItems: 'center' },
  fareDivider: { width: 1, backgroundColor: COLORS.border },
  fareLabel: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  fareValue: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  fareValueAmount: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  actionButtonText: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default ActiveRideScreen;
