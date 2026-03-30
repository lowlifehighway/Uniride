import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import CampusMap from '../../components/Map/CampusMap';
import MapMarker from '../../components/Map/MapMarker';
import RouteLayer from '../../components/Map/RouteLayer';
import CollapsibleBottomSheet from '../../components/CollapsibleBottomSheet';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getDirections,
  formatDistance,
  formatDuration,
} from '../../services/directions';
import { useAuth } from '../../hooks/useAuth';
import { createRideRequest } from '../../services/studentRides';
import { ScrollView } from 'react-native-web';

const PickupConfirmationScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const {
    pickup,
    destination,
    pickupName,
    destinationName,
    mode,
    time,
    // ✅ NEW: Use structured passenger data
    isForSelf,
    passengerType,
    passenger,
  } = route.params || {};
  console.log('checking route from pick up confirm screen', route.params);
  const [step, setStep] = useState('confirm');
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [selectedRide, setSelectedRide] = useState('express');
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);

  // Route state
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const pickupCoord = pickup || [3.7211, 6.8925];
  const destinationCoord = destination || [3.7221, 6.8935];

  const centerCoordinate = [
    (pickupCoord[0] + destinationCoord[0]) / 2,
    (pickupCoord[1] + destinationCoord[1]) / 2,
  ];

  useEffect(() => {
    fetchRoute();
  }, []);

  // ✅ Debug logging
  useEffect(() => {
    console.log('📋 Route Params:', {
      isForSelf,
      passengerType,
      passenger,
      hasPassenger: !!passenger,
      hasName: !!passenger?.name,
    });
  }, [isForSelf, passengerType, passenger]);

  const fetchRoute = async () => {
    setLoading(true);
    const data = await getDirections(pickupCoord, destinationCoord, 'driving');

    if (data) {
      setRouteData(data);
      console.log(
        '✅ Route loaded:',
        formatDistance(data.distance),
        formatDuration(data.duration),
      );
    } else {
      setRouteData({
        coordinates: [pickupCoord, destinationCoord],
        distance: 3200,
        duration: 480,
      });
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('confirm');
    } else {
      navigation.navigate('RidePlan');
    }
  };

  const handleRequestRide = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'Please sign in to request a ride');
      return;
    }

    setRequesting(true);

    // ✅ FIXED: Create default passenger data if missing
    const passengerData =
      passenger && passenger.name
        ? passenger
        : {
            name: user.displayName || 'Student',
            phone: user.phoneNumber || user.phone || '',
            relationship: 'Self',
          };

    const rideData = {
      // Student info (who's booking/paying)
      studentId: user.uid,

      // Location data
      pickup: {
        coordinates: pickupCoord,
        name: pickupName || 'Pickup Location',
      },
      destination: {
        coordinates: destinationCoord,
        name: destinationName || 'Destination',
      },

      // Ride settings
      rideType: selectedRide,
      paymentMethod: selectedPayment,
      status: 'pending',

      // Route data
      distance: routeData?.distance || 0,
      duration: routeData?.duration || 0,
      fare: selectedRide === 'express' ? 300 : 600,

      // ✅ Passenger data with fallbacks
      isForSelf: isForSelf !== undefined ? isForSelf : true,
      passengerName: passengerData.name,
      passengerPhone: passengerData.phone,
      passengerRelationship: passengerData.relationship || 'Self',

      // Additional metadata
      requestedAt: new Date().toISOString(),
    };

    console.log('🚗 Creating ride request:', rideData);

    const result = await createRideRequest(user.uid, rideData);
    setRequesting(false);

    if (result.success) {
      console.log('✅ Ride request successful:', result.data.rideId);

      // After successful ride creation
      navigation.navigate('DriverMatch', {
        rideId: result.data.rideId,
        rideType: selectedRide,
        paymentMethod: selectedPayment,

        // ✅ Pass coordinates
        pickup: pickupCoord, // [lng, lat]
        destination: destinationCoord, // [lng, lat]

        // ✅ Pass location names
        pickupName: pickupName || 'Pickup Location',
        destinationName: destinationName || 'Destination',

        // ✅ Pass route data
        routeData: routeData || {
          distance: 0,
          duration: 0,
          coordinates: [pickupCoord, destinationCoord],
        },
      });
    } else {
      Alert.alert('Error', result.error || 'Failed to create ride request');
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

  const renderConfirmDetails = () => (
    <>
      <Text style={styles.sheetTitle}>Confirm details</Text>

      {/* ✅ FIXED: Only render if passenger exists and has required data */}
      {passenger && passenger.name && (
        <View style={styles.passengerInfo}>
          <View style={styles.passengerHeader}>
            <Feather
              name={isForSelf ? 'user' : 'user-plus'}
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.passengerLabel}>
              {isForSelf ? 'Riding' : 'Riding for'}
            </Text>
          </View>
          <Text style={styles.passengerName}>{passenger.name}</Text>
          {!isForSelf && passenger.relationship && (
            <Text style={styles.passengerRelationship}>
              {passenger.relationship}
            </Text>
          )}
          {passenger.phone && (
            <Text style={styles.passengerPhone}>{passenger.phone}</Text>
          )}
        </View>
      )}

      {routeData && (
        <View style={styles.routeInfo}>
          <View style={styles.routeItem}>
            <Feather name="circle" size={12} color={COLORS.primary} />
            <Text style={styles.routeText} numberOfLines={1}>
              {pickupName || 'Pickup Location'}
            </Text>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeItem}>
            <Feather name="map-pin" size={12} color={COLORS.primary} />
            <Text style={styles.routeText} numberOfLines={1}>
              {destinationName || 'Destination'}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.rideCard,
          selectedRide === 'express' && styles.rideCardSelected,
        ]}
        onPress={() => setSelectedRide('express')}
      >
        <View style={styles.rideLeft}>
          <Feather name="zap" size={20} color={COLORS.primary} />
          <View style={styles.rideInfo}>
            <Text style={styles.rideType}>Express</Text>
            <Text style={styles.rideSubtext}>Shared ride • 2-3 passengers</Text>
          </View>
        </View>
        <View style={styles.ridePriceContainer}>
          <Text style={styles.ridePrice}>₦300</Text>
          <Text style={styles.rideOldPrice}>₦500</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.rideCard,
          selectedRide === 'private' && styles.rideCardSelected,
        ]}
        onPress={() => setSelectedRide('private')}
      >
        <View style={styles.rideLeft}>
          <Feather name="user" size={20} color={COLORS.primary} />
          <View style={styles.rideInfo}>
            <Text style={styles.rideType}>Private</Text>
            <Text style={styles.rideSubtext}>Just you • No sharing</Text>
          </View>
        </View>
        <View style={styles.ridePriceContainer}>
          <Text style={styles.ridePrice}>₦600</Text>
          <Text style={styles.rideOldPrice}>₦800</Text>
        </View>
      </TouchableOpacity>

      {routeData && (
        <View style={styles.rideDetails}>
          <View style={styles.detailItem}>
            <Feather name="navigation" size={16} color={COLORS.gray} />
            <Text style={styles.detailText}>
              {formatDistance(routeData.distance)} •{' '}
              {formatDuration(routeData.duration)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="clock" size={16} color={COLORS.gray} />
            <Text style={styles.detailText}>Arrives in 2-3 mins</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.rideButton}
        onPress={() => setStep('payment')}
      >
        <Text style={styles.rideButtonText}>Continue</Text>
        <View style={styles.rideIcon}>
          <Feather name="arrow-right" size={16} color={COLORS.background} />
        </View>
      </TouchableOpacity>
    </>
  );

  const renderPaymentOptions = () => (
    <>
      <Text style={styles.sheetTitle}>Payment options</Text>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPayment === 'wallet' && styles.paymentOptionSelected,
        ]}
        onPress={() => setSelectedPayment('wallet')}
      >
        <View style={styles.paymentLeft}>
          <View style={styles.paymentIcon}>
            <Feather name="credit-card" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.paymentLabel}>Uniride Cash: ₦7,000</Text>
        </View>
        <View style={styles.radioOuter}>
          {selectedPayment === 'wallet' && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPayment === 'transfer' && styles.paymentOptionSelected,
        ]}
        onPress={() => setSelectedPayment('transfer')}
      >
        <View style={styles.paymentLeft}>
          <View style={styles.paymentIcon}>
            <Feather name="send" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.paymentLabel}>Bank Transfer</Text>
        </View>
        <View style={styles.radioOuter}>
          {selectedPayment === 'transfer' && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPayment === 'cash' && styles.paymentOptionSelected,
        ]}
        onPress={() => setSelectedPayment('cash')}
      >
        <View style={styles.paymentLeft}>
          <View style={styles.paymentIcon}>
            <Feather name="dollar-sign" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.paymentLabel}>Cash</Text>
        </View>
        <View style={styles.radioOuter}>
          {selectedPayment === 'cash' && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>

      <View style={styles.paymentNote}>
        <Feather name="info" size={16} color={COLORS.gray} />
        <Text style={styles.paymentNoteText}>
          {selectedPayment === 'cash'
            ? 'Pay your driver in cash at the end of the trip'
            : selectedPayment === 'wallet'
              ? 'Amount will be deducted from your Uniride wallet'
              : 'You will be redirected to complete payment'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.rideButton, requesting && styles.rideButtonDisabled]}
        onPress={handleRequestRide}
        disabled={requesting}
      >
        {requesting ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <>
            <Text style={styles.rideButtonText}>Let's Ride</Text>
            <View style={styles.rideIcon}>
              <Feather name="navigation" size={16} color={COLORS.background} />
            </View>
          </>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <CampusMap
        style={styles.map}
        centerCoordinate={centerCoordinate}
        zoomLevel={15}
        showUserLocation={false}
      >
        {routeData && routeData.coordinates && (
          <RouteLayer coordinates={routeData.coordinates} />
        )}
        <MapMarker coordinate={pickupCoord} type="pickup" />
        <MapMarker coordinate={destinationCoord} type="destination" />
      </CampusMap>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Calculating route...</Text>
        </View>
      )}

      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="chevron-left" size={28} color={COLORS.background} />
        </TouchableOpacity>
      </SafeAreaView>

      <CollapsibleBottomSheet
        isExpanded={isSheetExpanded}
        onToggle={setIsSheetExpanded}
        collapsedHeight={120}
      >
        <View style={styles.sheetContent}>
          {step === 'confirm' ? renderConfirmDetails() : renderPaymentOptions()}
        </View>
      </CollapsibleBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: { color: COLORS.white, fontSize: 16, marginTop: 12 },
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
  webButtonText: { color: COLORS.background, fontSize: 16, fontWeight: 'bold' },
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
  sheetContent: { paddingTop: 10 },
  sheetTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  // Passenger info styles
  passengerInfo: {
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
    marginBottom: 2,
  },
  passengerRelationship: {
    color: COLORS.primary,
    fontSize: 13,
    marginBottom: 4,
  },
  passengerPhone: {
    color: COLORS.gray,
    fontSize: 14,
  },
  routeInfo: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  routeItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDivider: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.gray,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeText: { color: COLORS.white, fontSize: 14, flex: 1 },
  rideCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rideCardSelected: { borderColor: COLORS.primary },
  rideLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rideInfo: { flex: 1 },
  rideType: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  rideSubtext: { color: COLORS.gray, fontSize: 14 },
  ridePriceContainer: { alignItems: 'flex-end' },
  ridePrice: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  rideOldPrice: {
    color: COLORS.gray,
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: COLORS.white, fontSize: 14 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionSelected: { borderColor: COLORS.primary },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentLabel: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  paymentNoteText: {
    color: COLORS.gray,
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
  rideButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  rideButtonDisabled: { backgroundColor: COLORS.gray },
  rideButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  rideIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PickupConfirmationScreen;
