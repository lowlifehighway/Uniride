import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { getStudentRideHistory } from '../../services/studentRides';

const ActivityScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, cancelled

  useEffect(() => {
    if (user?.uid) {
      loadRideHistory();
    }
  }, [user]);

  const loadRideHistory = async () => {
    if (!user?.uid) return;

    setLoading(true);
    const result = await getStudentRideHistory(user.uid, 50);

    if (result.success) {
      console.log('✅ Loaded ride history:', result.data.length, 'rides');
      setRides(result.data);
    } else {
      console.error('❌ Error loading rides:', result.error);
    }

    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRideHistory();
    setRefreshing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.lightGreen;
      case 'cancelled':
        return COLORS.error;
      case 'inProgress':
        return COLORS.primary;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'inProgress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      default:
        return status;
    }
  };

  const filteredRides = rides.filter((ride) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return ride.status === 'completed';
    if (filter === 'cancelled') return ride.status === 'cancelled';
    return true;
  });

  const renderRideCard = (ride) => (
    <TouchableOpacity
      key={ride.id}
      style={styles.rideCard}
      onPress={() => {
        // Navigate to ride details
        navigation.navigate('RideDetails', { ride: ride });
      }}
      activeOpacity={0.7}
    >
      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(ride.status) },
        ]}
      >
        <Text style={styles.statusText}>{getStatusText(ride.status)}</Text>
      </View>

      {/* Route Info */}
      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <View style={styles.iconContainer}>
            <Feather name="circle" size={12} color={COLORS.primary} />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.pickup?.name || 'Pickup Location'}
          </Text>
        </View>

        <View style={styles.routeDivider} />

        <View style={styles.routeRow}>
          <View style={styles.iconContainer}>
            <Feather name="map-pin" size={12} color={COLORS.primary} />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.destination?.name || 'Destination'}
          </Text>
        </View>
      </View>

      {/* Ride Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={14} color={COLORS.gray} />
          <Text style={styles.detailText}>
            {formatDate(ride.completedAt || ride.requestedAt)}
          </Text>
        </View>

        {ride.driver && (
          <View style={styles.detailRow}>
            <Feather name="user" size={14} color={COLORS.gray} />
            <Text style={styles.detailText}>{ride.driver.name}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Feather name="zap" size={14} color={COLORS.gray} />
          <Text style={styles.detailText}>
            {ride.rideType === 'express' ? 'Express' : 'Private'}
          </Text>
        </View>

        <View style={styles.fareContainer}>
          <Text style={styles.fareText}>₦{ride.fare}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
        onPress={() => setFilter('all')}
      >
        <Text
          style={[
            styles.filterText,
            filter === 'all' && styles.filterTextActive,
          ]}
        >
          All ({rides.length})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          filter === 'completed' && styles.filterChipActive,
        ]}
        onPress={() => setFilter('completed')}
      >
        <Text
          style={[
            styles.filterText,
            filter === 'completed' && styles.filterTextActive,
          ]}
        >
          Completed ({rides.filter((r) => r.status === 'completed').length})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          filter === 'cancelled' && styles.filterChipActive,
        ]}
        onPress={() => setFilter('cancelled')}
      >
        <Text
          style={[
            styles.filterText,
            filter === 'cancelled' && styles.filterTextActive,
          ]}
        >
          Cancelled ({rides.filter((r) => r.status === 'cancelled').length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Feather name="clock" size={48} color={COLORS.gray} />
      </View>
      <Text style={styles.emptyTitle}>No Activity Yet</Text>
      <Text style={styles.emptyText}>
        {filter === 'all'
          ? 'Your ride history will appear here'
          : filter === 'completed'
            ? "You haven't completed any rides yet"
            : "You haven't cancelled any rides"}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() =>
          navigation.navigate('ServicesScreen', { screen: 'RidePlan' })
        }
      >
        <Text style={styles.emptyButtonText}>Book a Ride</Text>
        <Feather name="arrow-right" size={16} color={COLORS.background} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity</Text>
          <Feather name="clock" size={24} color={COLORS.primary} />
        </View>

        {/* Filter Chips */}
        {rides.length > 0 && renderFilterChips()}

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your rides...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
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
            {filteredRides.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <Text style={styles.sectionTitle}>
                  {filter === 'all'
                    ? 'All Rides'
                    : filter === 'completed'
                      ? 'Completed Rides'
                      : 'Cancelled Rides'}
                </Text>
                {filteredRides.map(renderRideCard)}
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  rideCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
  },
  locationText: {
    color: COLORS.white,
    fontSize: 15,
    flex: 1,
  },
  routeDivider: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.gray,
    marginLeft: 11,
    marginVertical: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: COLORS.gray,
    fontSize: 13,
  },
  fareContainer: {
    marginLeft: 'auto',
  },
  fareText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  emptyButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ActivityScreen;
