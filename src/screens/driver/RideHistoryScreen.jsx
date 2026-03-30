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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';

// Import Firebase services
import { getDriverRideHistory } from '../../services/rides';

const RideHistoryScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: 'all', label: 'All', count: rides.length },
    {
      id: 'completed',
      label: 'Completed',
      count: rides.filter((r) => r.status === 'completed').length,
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      count: rides.filter((r) => r.status === 'cancelled').length,
    },
  ];

  // Load ride history on mount
  useEffect(() => {
    loadRideHistory();
  }, [selectedFilter]);

  const loadRideHistory = async () => {
    if (!user?.uid) return;

    setLoading(true);

    const result = await getDriverRideHistory(user.uid, selectedFilter, 50);

    if (result.success) {
      console.log('✅ Loaded ride history:', result.data.length, 'rides');
      setRides(result.data);
    } else {
      console.error('❌ Error loading history:', result.error);
    }

    setLoading(false);
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadRideHistory();
    setRefreshing(false);
  };

  // Format date - matches student format
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return `${hours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper functions
  const formatDistance = (meters) => {
    if (!meters) return '0 km';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const renderRideCard = (ride) => (
    <TouchableOpacity
      key={ride.id}
      style={styles.rideCard}
      onPress={() => navigation.navigate('RideDetails', { ride })}
      activeOpacity={0.7}
    >
      {/* Status Badge */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.statusBadge,
            ride.status === 'cancelled' && styles.statusBadgeCancelled,
          ]}
        >
          <Feather
            name={ride.status === 'completed' ? 'check-circle' : 'x-circle'}
            size={12}
            color={ride.status === 'completed' ? COLORS.success : COLORS.error}
          />
          <Text
            style={[
              styles.statusText,
              ride.status === 'cancelled' && styles.statusTextCancelled,
            ]}
          >
            {ride.status === 'completed' ? 'Completed' : 'Cancelled'}
          </Text>
        </View>
        <Text style={styles.rideDate}>
          {formatDate(ride.completedAt || ride.cancelledAt)}
        </Text>
      </View>

      {/* Student Info */}
      <View style={styles.studentSection}>
        <View style={styles.avatar}>
          <Feather name="user" size={18} color={COLORS.gray} />
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {ride.studentInfo?.firstName || 'Student'}{' '}
            {ride.studentInfo?.lastName || ''}
          </Text>
          {ride.driverRating?.rating && (
            <View style={styles.ratingContainer}>
              <Feather name="star" size={12} color={COLORS.warning} />
              <Text style={styles.rating}>{ride.driverRating.rating}.0</Text>
            </View>
          )}
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeContainer}>
        <View style={styles.routeItem}>
          <View style={styles.routeDot}>
            <Feather name="circle" size={8} color={COLORS.primary} />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.pickup?.name || 'Pickup location'}
          </Text>
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routeItem}>
          <View style={styles.routeDot}>
            <Feather name="map-pin" size={8} color={COLORS.primary} />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.destination?.name || 'Destination'}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.stat}>
          <Feather name="navigation" size={14} color={COLORS.gray} />
          <Text style={styles.statText}>{formatDistance(ride.distance)}</Text>
        </View>
        <View style={styles.stat}>
          <Feather name="clock" size={14} color={COLORS.gray} />
          <Text style={styles.statText}>{formatDuration(ride.duration)}</Text>
        </View>
        <Text style={styles.fareAmount}>₦{ride.fare || 0}</Text>
      </View>
    </TouchableOpacity>
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
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header - Matches Student */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Ride History</Text>
          </View>
          <View>
            <Text style={styles.subtitle}>
              {rides.length} ride{rides.length !== 1 ? 's' : ''} total
            </Text>
          </View>
        </View>

        {/* Filters - Chip Style */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
                {filter.count > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      selectedFilter === filter.id && styles.filterBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        selectedFilter === filter.id &&
                          styles.filterBadgeTextActive,
                      ]}
                    >
                      {filter.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
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
              <Text style={styles.emptyTitle}>No Rides Found</Text>
              <Text style={styles.emptyText}>
                Your ride history will appear here
              </Text>
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
  // Header - Matches Student
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Filters - Chip Style
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
    fontWeight: '600',
  },
  filterTextActive: { color: COLORS.background },
  filterBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: COLORS.white,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  filterBadgeTextActive: {
    color: COLORS.primary,
  },
  // Rides Container
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeCancelled: { backgroundColor: COLORS.error + '20' },
  statusText: {
    fontSize: THEME.fontSize.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  statusTextCancelled: { color: COLORS.error },
  rideDate: { fontSize: THEME.fontSize.xs, color: COLORS.gray },
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
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentName: {
    fontSize: THEME.fontSize.md,
    color: COLORS.white,
    fontWeight: '600',
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: THEME.fontSize.sm, color: COLORS.gray },
  routeContainer: { marginBottom: 12 },
  routeItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeLine: {
    width: 2,
    height: 12,
    backgroundColor: COLORS.border,
    marginLeft: 7,
    marginVertical: 2,
  },
  locationText: { fontSize: THEME.fontSize.sm, color: COLORS.white, flex: 1 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: THEME.fontSize.xs, color: COLORS.gray },
  fareAmount: {
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    color: COLORS.success,
    marginLeft: 'auto',
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
  },
});

export default RideHistoryScreen;
