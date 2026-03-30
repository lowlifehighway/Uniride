import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { downloadReceipt } from '../../services/recieptService';

// ✅ Import Firebase services
import { getRideDetails } from '../../services/rides';

const RideDetailsScreen = ({ route, navigation }) => {
  const { user, userRole } = useAuth();
  const { ride: initialRide } = route.params || {};

  const [ride, setRide] = useState(initialRide);
  const [loading, setLoading] = useState(!initialRide);
  const person = userRole === 'driver' ? ride?.studentInfo : ride?.driverInfo;
  person?.profilePic && console.log('profile pic');

  // ✅ Load full ride details
  useEffect(() => {
    if (initialRide?.id) {
      console.log('getting ride id');
      loadRideDetails();
    }
    console.log('not getting it');
  }, [initialRide?.id]);

  const handleDownloadReceipt = async () => {
    await downloadReceipt(ride);
  };
  const loadRideDetails = async () => {
    if (!initialRide?.id) return;

    setLoading(true);

    const result = await getRideDetails(initialRide.id, userRole);

    if (result.success) {
      console.log('✅ Loaded ride details');
      setRide(result.data);
    } else {
      console.error('❌ Error loading details:', result.error);
      Alert.alert('Error', 'Failed to load ride details');
    }

    setLoading(false);
  };

  const handleCall = () => {
    const phoneNumber = person?.phone;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // ✅ Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  // ✅ Calculate driver earnings (85% of fare)
  const calculateEarnings = (fare) => {
    const earnings = Math.round(fare * 0.85);
    const fee = Math.round(fare * 0.15);
    return { earnings, fee };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 100 }}
        />
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ textAlign: 'center', marginTop: 100 }}>
          Ride not found
        </Text>
      </SafeAreaView>
    );
  }

  const { earnings, fee } = calculateEarnings(ride.fare || 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="x" size={32} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="x" size={32} color={COLORS.white} />
          </TouchableOpacity>
          <View
            style={[
              styles.statusIcon,
              ride.status === 'cancelled' && styles.statusIconCancelled,
            ]}
          >
            <Feather
              name={ride.status === 'completed' ? 'check-circle' : 'x-circle'}
              size={32}
              color={COLORS.white}
            />
          </View>
          <Text style={styles.statusTitle}>
            {ride.status === 'completed' ? 'Ride Completed' : 'Ride Cancelled'}
          </Text>
          <Text style={styles.statusDate}>
            {formatDate(ride.completedAt || ride.cancelledAt)}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {userRole === 'driver' ? 'Student' : 'Driver'}
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.studentHeader}>
              <View style={styles.studentInfo}>
                <View style={styles.avatar}>
                  {person?.profilePic ? (
                    <Image
                      source={{ uri: person.profilePic }}
                      style={styles.avatar}
                    />
                  ) : (
                    <Feather name="user" size={24} color={COLORS.gray} />
                  )}
                </View>
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName}>
                    {person?.firstName + ' ' + person?.lastName}
                  </Text>
                  {person?.rating && (
                    <View style={styles.ratingContainer}>
                      <Feather name="star" size={14} color={COLORS.warning} />
                      <Text style={styles.rating}>{person.rating}</Text>
                    </View>
                  )}
                </View>
              </View>
              {ride.status === 'completed' && person?.phone && (
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={handleCall}
                >
                  <Feather name="phone" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.infoCard}>
            {/* Ride ID */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ride ID</Text>
              <Text style={styles.detailValue}>{ride.id}</Text>
            </View>

            <View style={styles.divider} />

            {/* Pickup */}
            <View style={styles.locationRow}>
              <View style={styles.locationDot}>
                <Feather name="circle" size={10} color={COLORS.primary} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Pickup Location</Text>
                <Text style={styles.locationAddress}>
                  {ride.pickup?.name || 'Pickup location'}
                </Text>
              </View>
            </View>

            <View style={styles.locationLine} />

            {/* Destination */}
            <View style={styles.locationRow}>
              <View style={styles.locationDot}>
                <Feather name="map-pin" size={10} color={COLORS.primary} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Destination</Text>
                <Text style={styles.locationAddress}>
                  {ride.destination?.name || 'Destination'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Distance & Duration */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Feather name="navigation" size={18} color={COLORS.gray} />
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Distance</Text>
                  <Text style={styles.statValue}>
                    {ride.distance
                      ? `${(ride.distance / 1000).toFixed(1)} km`
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Feather name="clock" size={18} color={COLORS.gray} />
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Duration</Text>
                  <Text style={styles.statValue}>
                    {ride.duration
                      ? `${Math.floor(ride.duration / 60)} mins`
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.infoCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ride Fare</Text>
              <Text style={styles.detailValue}>₦{ride.fare || 0}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Platform Fee (15%)</Text>
              <Text style={styles.detailValue}>-₦{fee}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.totalLabel}>Your Earnings</Text>
              <Text style={styles.totalValue}>₦{earnings}</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        {ride.status === 'completed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.infoCard}>
              {ride.requestedAt && (
                <>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineLabel}>Ride Requested</Text>
                      <Text style={styles.timelineTime}>
                        {formatDate(ride.requestedAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.timelineLine} />
                </>
              )}

              {ride.acceptedAt && (
                <>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineLabel}>Ride Accepted</Text>
                      <Text style={styles.timelineTime}>
                        {formatDate(ride.acceptedAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.timelineLine} />
                </>
              )}

              {ride.startedAt && (
                <>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineLabel}>
                        Picked Up Student
                      </Text>
                      <Text style={styles.timelineTime}>
                        {formatDate(ride.startedAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.timelineLine} />
                </>
              )}

              {ride.completedAt && (
                <View style={styles.timelineItem}>
                  <View
                    style={[styles.timelineDot, styles.timelineDotComplete]}
                  />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineLabel}>Ride Completed</Text>
                    <Text style={styles.timelineTime}>
                      {formatDate(ride.completedAt)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Actions */}
        {userRole === 'student' && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDownloadReceipt}
            >
              <Feather name="download" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Download Receipt</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    // backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    display: 'none',
  },
  backButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 8,
    backgroundColor: COLORS.darkGray,
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  supportButton: { padding: 8 },
  statusCard: {
    backgroundColor: COLORS.darkGray,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconCancelled: { backgroundColor: COLORS.error },
  statusTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  statusDate: { fontSize: THEME.fontSize.md, color: COLORS.gray },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 16,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 75,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentDetails: { flex: 1 },
  studentName: {
    fontSize: THEME.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: THEME.fontSize.sm, color: COLORS.gray },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: { fontSize: THEME.fontSize.md, color: COLORS.gray },
  detailValue: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: { height: 1, backgroundColor: COLORS.border },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  locationDot: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationLine: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.border,
    marginLeft: 11,
  },
  locationInfo: { flex: 1, marginLeft: 12 },
  locationLabel: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: THEME.fontSize.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  statsRow: { flexDirection: 'row', paddingTop: 12 },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  statInfo: { flex: 1 },
  statLabel: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalLabel: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  timelineItem: { flexDirection: 'row', alignItems: 'center' },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.primary + '30',
  },
  timelineDotComplete: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success + '30',
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  timelineContent: { flex: 1, marginLeft: 16 },
  timelineLabel: {
    fontSize: THEME.fontSize.md,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineTime: { fontSize: THEME.fontSize.sm, color: COLORS.gray },
  actionsSection: { paddingHorizontal: 20, gap: 12 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.darkGray,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default RideDetailsScreen;
