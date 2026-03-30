import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';

// Import Firebase services
import { getAvailableRides, acceptRide } from '../../services/rides';
import { useToast } from '../../contexts/ToastContext';

const AvailableRidesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingRideId, setAcceptingRideId] = useState(null);

  useEffect(() => {
    loadAvailableRides();
  }, []);

  const loadAvailableRides = async () => {
    setLoading(true);
    const result = await getAvailableRides();

    if (result.success) {
      setRides(result.data);
      console.log('✅ Loaded available rides:', result.data.length);
    } else {
      console.error('❌ Error loading rides:', result.error);
    }

    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAvailableRides();
    setRefreshing(false);
  };

  const handleAcceptRide = async (ride) => {
    Alert.alert(
      'Accept Ride?',
      `Pickup: ${ride.pickup?.name}\nDestination: ${ride.destination?.name}\nFare: ₦${ride.fare}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setAcceptingRideId(ride.id);

            const result = await acceptRide(ride.id, user.uid);

            setAcceptingRideId(null);

            if (result.success) {
              showToast('Ride accepted!', 'success');
              navigation.navigate('ActiveRide', { ride: result.data });
            } else {
              showToast(result.error || 'Failed to accept ride', 'error');
            }
          },
        },
      ],
    );
  };

  const formatDistance = (meters) => {
    if (!meters) return '0 km';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const renderRideCard = (ride) => (
    <View key={ride.id} style={styles.rideCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          <Feather
            name={ride.rideType === 'express' ? 'zap' : 'shield'}
            size={14}
            color={COLORS.primary}
          />
          <Text style={styles.typeText}>
            {ride.rideType === 'express' ? 'Express' : 'Private'}
          </Text>
        </View>
        <Text style={styles.timeText}>{formatTime(ride.requestedAt)}</Text>
      </View>

      {/* Student Info */}
      <View style={styles.studentSection}>
        <View style={styles.avatar}>
          <Feather name="user" size={18} color={COLORS.gray} />
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {ride?.passengerName || 'Student'}
          </Text>
          <Text style={styles.studentPhone}>
            {ride?.passengerPhone || 'No phone'}
          </Text>
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeContainer}>
        <View style={styles.routeItem}>
          <View style={styles.routeDot}>
            <Feather name="circle" size={8} color={COLORS.primary} />
          </View>
          <Text style={styles.locationText} numberOfLines={2}>
            {ride.pickup?.name || 'Pickup location'}
          </Text>
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routeItem}>
          <View style={styles.routeDot}>
            <Feather name="map-pin" size={8} color={COLORS.primary} />
          </View>
          <Text style={styles.locationText} numberOfLines={2}>
            {ride.destination?.name || 'Destination'}
          </Text>
        </View>
      </View>

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Feather name="navigation" size={14} color={COLORS.gray} />
          <Text style={styles.infoText}>{formatDistance(ride.distance)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Feather
            name={
              ride.paymentMethod === 'cash'
                ? 'dollar-sign'
                : ride.paymentMethod === 'wallet'
                  ? 'credit-card'
                  : 'send'
            }
            size={14}
            color={COLORS.gray}
          />
          <Text style={styles.infoText}>
            {ride.paymentMethod === 'cash'
              ? 'Cash'
              : ride.paymentMethod === 'wallet'
                ? 'Wallet'
                : 'Transfer'}
          </Text>
        </View>
        <Text style={styles.fareAmount}>₦{ride.fare || 0}</Text>
      </View>

      {/* Accept Button */}
      <TouchableOpacity
        style={[
          styles.acceptButton,
          acceptingRideId === ride.id && styles.acceptButtonDisabled,
        ]}
        onPress={() => handleAcceptRide(ride)}
        disabled={acceptingRideId === ride.id}
      >
        {acceptingRideId === ride.id ? (
          <ActivityIndicator size="small" color={COLORS.background} />
        ) : (
          <>
            <Text style={styles.acceptButtonText}>Accept Ride</Text>
            <Feather name="arrow-right" size={18} color={COLORS.background} />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Available Rides</Text>
            <Text style={styles.subtitle}>
              {rides.length} ride{rides.length !== 1 ? 's' : ''} waiting
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Rides List */}
        <View style={styles.ridesContainer}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 40 }}
            />
          ) : rides.length > 0 ? (
            rides.map(renderRideCard)
          ) : (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={64} color={COLORS.gray} />
              <Text style={styles.emptyTitle}>No Available Rides</Text>
              <Text style={styles.emptyText}>
                New ride requests will appear here
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
              >
                <Feather
                  name="refresh-cw"
                  size={18}
                  color={COLORS.background}
                />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: THEME.fontSize.md,
    color: COLORS.gray,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ridesContainer: { paddingHorizontal: 20 },
  rideCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeText: {
    fontSize: THEME.fontSize.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  timeText: {
    fontSize: THEME.fontSize.xs,
    color: COLORS.gray,
  },
  studentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInfo: { flex: 1 },
  studentName: {
    fontSize: THEME.fontSize.md,
    color: COLORS.white,
    fontWeight: '600',
    marginBottom: 2,
  },
  studentPhone: {
    fontSize: THEME.fontSize.xs,
    color: COLORS.gray,
  },
  routeContainer: { marginBottom: 12 },
  routeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  routeDot: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  routeLine: {
    width: 2,
    height: 12,
    backgroundColor: COLORS.border,
    marginLeft: 7,
    marginVertical: 2,
  },
  locationText: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.white,
    flex: 1,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
    marginBottom: 12,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: THEME.fontSize.xs, color: COLORS.gray },
  fareAmount: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.success,
    marginLeft: 'auto',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: THEME.fontSize.md,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  refreshButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
  },
});

export default AvailableRidesScreen;
