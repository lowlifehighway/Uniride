import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import BottomSheetModal from '../../components/Modals/BottomSheetModal';
import RadioOption from '../../components/Inputs/RadioOption';
import AddContactModal from '../../components/Modals/AddContactModal';
import ContactDisplay from '../../components/ContactDisplay';
import LocationPickerModal from '../../components/Modals/LocationPickerModal';
import QuickOption from '../../components/Navigation/QuickOption';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { CAMPUS_LOCATIONS } from '../../config/mapbox';
import { useAuth } from '../../hooks/useAuth';

const RidePlanScreen = ({ navigation, route }) => {
  const { mode = 'ride' } = route.params || {};
  const { user, userData } = useAuth();

  // Modal states
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);

  // Selection states
  const [selectedTime, setSelectedTime] = useState('now');
  const [selectedPassenger, setSelectedPassenger] = useState('me');
  const [contact, setContact] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);

  // Location states
  const [currentGPS, setCurrentGPS] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Memoized values
  const isCourierMode = useMemo(() => mode === 'courier', [mode]);
  const canProceed = useMemo(
    () => pickupLocation && destinationLocation,
    [pickupLocation, destinationLocation],
  );

  // Derived labels
  const timeLabel = useMemo(
    () => (selectedTime === 'now' ? 'Pickup now' : 'Pickup later'),
    [selectedTime],
  );

  const passengerLabel = useMemo(() => {
    if (selectedPassenger === 'me') return 'For me';
    if (contact) return contact.name;
    return 'For someone else';
  }, [selectedPassenger, contact]);

  const destinationPlaceholder = useMemo(
    () => (isCourierMode ? "Choose recipient's location" : 'Where to ?'),
    [isCourierMode],
  );

  // Location initialization
  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync();

      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');

        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Location permission is required to use this feature',
          );
          setIsLoadingLocation(false);
          return;
        }
      } else {
        setLocationPermission(true);
      }

      await getCurrentLocationAndSelect();
    } catch (error) {
      console.error('Error initializing location:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const getCurrentLocationAndSelect = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const locationData = {
        id: 'current',
        name: 'Current Location',
        fullName: 'Your Current Location',
        coordinates: [location.coords.longitude, location.coords.latitude],
        address: 'GPS Location',
        type: 'current',
      };

      setCurrentGPS({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (!pickupLocation) {
        setPickupLocation(locationData);
      } else if (!destinationLocation) {
        setDestinationLocation(locationData);
      } else {
        Alert.alert(
          'Replace Location',
          'Which location would you like to replace?',
          [
            { text: 'Pickup', onPress: () => setPickupLocation(locationData) },
            {
              text: 'Destination',
              onPress: () => setDestinationLocation(locationData),
            },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please select manually.',
      );
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted') {
        await getCurrentLocationAndSelect();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission(false);
    }
  };

  // Passenger data
  const getPassengerData = useCallback(() => {
    if (selectedPassenger === 'me') {
      return {
        isForSelf: true,
        passengerType: 'self',
        passenger: {
          id: user?.uid,
          name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
          phone: userData?.phone || user?.phoneNumber || '',
          relationship: 'Self',
        },
      };
    } else {
      return {
        isForSelf: false,
        passengerType: 'contact',
        passenger: {
          id: null,
          name: contact?.name || '',
          phone: contact?.phone || '',
          relationship: contact?.relationship || 'Other',
        },
      };
    }
  }, [selectedPassenger, contact, user, userData]);

  // Event handlers
  const handleDone = useCallback(() => {
    if (!canProceed) {
      Alert.alert(
        'Missing Information',
        'Please select both pickup and destination locations',
      );
      return;
    }

    const passengerData = getPassengerData();

    console.log('📋 Ride Details:', {
      pickup: pickupLocation.name,
      destination: destinationLocation.name,
      mode,
      time: selectedTime,
      passenger: passengerData.passenger.name,
      isForSelf: passengerData.isForSelf,
    });

    navigation.navigate('PickupConfirmation', {
      pickup: pickupLocation.coordinates,
      destination: destinationLocation.coordinates,
      pickupName: pickupLocation.name,
      destinationName: destinationLocation.name,
      mode,
      time: selectedTime,
      isForSelf: passengerData.isForSelf,
      passengerType: passengerData.passengerType,
      passenger: passengerData.passenger,
      selectedPassenger,
      contact,
    });
  }, [
    canProceed,
    pickupLocation,
    destinationLocation,
    navigation,
    mode,
    selectedTime,
    selectedPassenger,
    contact,
    getPassengerData,
  ]);

  const handleLocationSelect = useCallback((type, location) => {
    if (type === 'pickup') {
      setPickupLocation(location);
      setShowPickupModal(false);
    } else {
      setDestinationLocation(location);
      setShowDestinationModal(false);
    }
  }, []);

  const handlePassengerSelect = useCallback(
    (type) => {
      setSelectedPassenger(type);
      setShowPassengerModal(false);

      if (type === 'contact' && !contact) {
        setTimeout(() => setShowAddContactModal(true), 300);
      } else if (type !== 'contact') {
        setContact(null);
      }
    },
    [contact],
  );

  const handleSaveContact = useCallback((contactData) => {
    setContact(contactData);
    setSelectedPassenger('contact');
  }, []);

  const handleQuickLocation = useCallback(
    (locationKey) => {
      const location = CAMPUS_LOCATIONS[locationKey];
      if (!location) return;

      if (!pickupLocation) {
        setPickupLocation(location);
      } else if (!destinationLocation) {
        setDestinationLocation(location);
      } else {
        Alert.alert(
          'Replace Location',
          'Which location would you like to replace?',
          [
            { text: 'Pickup', onPress: () => setPickupLocation(location) },
            {
              text: 'Destination',
              onPress: () => setDestinationLocation(location),
            },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
      }
    },
    [pickupLocation, destinationLocation],
  );

  // Quick options data
  const quickOptions = useMemo(
    () => [
      {
        icon: 'map-pin',
        title: 'Current Location',
        // subtitle: 'VP09+VPP, Ilishan 121103, ogun',
        iconBg: COLORS.primary,
        onPress: () => getCurrentLocationAndSelect(),
      },
      {
        icon: 'home',
        title: 'Emerald Hall',
        subtitle: 'Babcock University Campus',
        iconBg: COLORS.primary,
        onPress: () => handleQuickLocation('EMERALD_HALL'),
      },
      {
        icon: 'star',
        title: 'Saved places',
        iconBg: COLORS.darkGray,
        onPress: () => setShowPickupModal(true),
      },
    ],
    [handleQuickLocation],
  );

  return (
    // ✅ FIX: Changed backgroundColor from 'white' to COLORS.background
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={COLORS.background}
          />

          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ServicesScreen')}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="chevron-left" size={28} color={COLORS.white} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>
                {isCourierMode ? 'Courier 📦' : 'Plan your ride 🛺'}
              </Text>

              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() =>
                    navigation.navigate('RidePlan', {
                      mode: isCourierMode ? 'ride' : 'courier',
                    })
                  }
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="repeat" size={20} color={COLORS.background} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Loading indicator while getting location */}
            {isLoadingLocation && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Getting your location...</Text>
              </View>
            )}

            {/* Dropdown Buttons */}
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowTimeModal(true)}
                activeOpacity={0.7}
              >
                <Feather name="clock" size={18} color={COLORS.background} />
                <Text style={styles.dropdownText} numberOfLines={1}>
                  {timeLabel}
                </Text>
                <Feather
                  name="chevron-down"
                  size={18}
                  color={COLORS.background}
                />
              </TouchableOpacity>

              {!isCourierMode && (
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowPassengerModal(true)}
                  activeOpacity={0.7}
                >
                  <Feather name="user" size={18} color={COLORS.background} />
                  <Text style={styles.dropdownText} numberOfLines={1}>
                    {passengerLabel}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={18}
                    color={COLORS.background}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Contact Display */}
            {contact && selectedPassenger === 'contact' && (
              <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>Riding for:</Text>
                <ContactDisplay
                  contact={contact}
                  onEdit={() => setShowAddContactModal(true)}
                  onRemove={() => {
                    setContact(null);
                    setSelectedPassenger('me');
                  }}
                />
              </View>
            )}

            {/* Location Inputs */}
            <View style={styles.inputsContainer}>
              <TouchableOpacity
                style={styles.locationInputWrapper}
                onPress={() => setShowPickupModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.locationIcon}>
                  <Feather name="circle" size={16} color={COLORS.white} />
                </View>
                <Text
                  style={[
                    styles.locationInputText,
                    !pickupLocation && styles.placeholderText,
                  ]}
                  numberOfLines={1}
                >
                  {pickupLocation?.name || 'Enter Pick up location'}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.locationInputWrapper}
                onPress={() => setShowDestinationModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.locationIcon}>
                  <Feather name="map-pin" size={16} color={COLORS.white} />
                </View>
                <Text
                  style={[
                    styles.locationInputText,
                    !destinationLocation && styles.placeholderText,
                  ]}
                  numberOfLines={1}
                >
                  {destinationLocation?.name || destinationPlaceholder}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Options */}
            <View style={styles.quickOptions}>
              {quickOptions.map((option, index) => (
                <QuickOption key={index} {...option} />
              ))}
            </View>
          </ScrollView>

          {/* Fixed Bottom Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.doneButton,
                !canProceed && styles.doneButtonDisabled,
              ]}
              onPress={handleDone}
              disabled={!canProceed}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>
                {!canProceed ? 'Select Locations' : 'Continue'}
              </Text>
              {canProceed && (
                <Feather
                  name="arrow-right"
                  size={20}
                  color={COLORS.background}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Modals */}
          <BottomSheetModal
            visible={showTimeModal}
            onClose={() => setShowTimeModal(false)}
            title="When do you need a ride ?"
          >
            <RadioOption
              icon="zap"
              title="Now"
              subtitle="Request a ride, hop-in and go"
              selected={selectedTime === 'now'}
              onPress={() => {
                setSelectedTime('now');
                setShowTimeModal(false);
              }}
            />
            <RadioOption
              icon="calendar"
              title="Later"
              subtitle="Reserve for extra peace of mind"
              selected={selectedTime === 'later'}
              onPress={() => {
                setSelectedTime('later');
                setShowTimeModal(false);
              }}
            />
          </BottomSheetModal>

          {!isCourierMode && (
            <BottomSheetModal
              visible={showPassengerModal}
              onClose={() => setShowPassengerModal(false)}
              title="Choose passenger ?"
            >
              <RadioOption
                icon="user"
                title="Me"
                subtitle="I'm taking this ride"
                selected={selectedPassenger === 'me'}
                onPress={() => handlePassengerSelect('me')}
              />
              <RadioOption
                icon="user-plus"
                title={contact ? contact.name : 'Someone else'}
                subtitle={
                  contact
                    ? `${contact.phone}${contact.relationship ? ` • ${contact.relationship}` : ''}`
                    : 'Book a ride for someone else'
                }
                selected={selectedPassenger === 'contact'}
                onPress={() => handlePassengerSelect('contact')}
              />
            </BottomSheetModal>
          )}

          <LocationPickerModal
            visible={showPickupModal}
            onClose={() => setShowPickupModal(false)}
            onSelect={(location) => handleLocationSelect('pickup', location)}
            title="Select Pickup Location"
            currentLocation={pickupLocation}
          />

          <LocationPickerModal
            visible={showDestinationModal}
            onClose={() => setShowDestinationModal(false)}
            onSelect={(location) =>
              handleLocationSelect('destination', location)
            }
            title="Select Destination"
            currentLocation={destinationLocation}
          />

          <AddContactModal
            visible={showAddContactModal}
            onClose={() => setShowAddContactModal(false)}
            onSave={handleSaveContact}
            initialData={contact}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </KeyboardAvoidingView>
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
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  loadingText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
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
  headerTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    flex: 1,
    marginLeft: 16,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  switchButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    flex: 1,
  },
  dropdownText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.sm,
    flex: 1,
  },
  contactSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.sm,
    marginBottom: 12,
    opacity: 0.8,
  },
  inputsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 25,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  locationIcon: {
    width: 24,
    alignItems: 'center',
  },
  locationInputText: {
    flex: 1,
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
  },
  placeholderText: {
    color: COLORS.gray,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  quickOptions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.background,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doneButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  doneButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
  },
});

export default RidePlanScreen;
