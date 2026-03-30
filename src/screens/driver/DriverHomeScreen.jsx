import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActiveRideBanner from '../../components/Cards/ActiveRideBanner';
import SuggestionCard from '../../components/Cards/SuggestionCard';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { subscribeToDriverActiveRide } from '../../services/activeRide';
import {
  getDriverStats,
  subscribeToDriverProfile,
  updateDriverLocation,
  updateDriverStatus,
} from '../../services/driver';

const DriverHomeScreen = ({ navigation }) => {
  const { user, userData } = useAuth();
  const { unreadCount } = useNotifications();
  const [activeRide, setActiveRide] = useState(null);
  const [isOnline, setIsOnline] = useState(userData?.isOnline || false);
  const [todayStats, setTodayStats] = useState({
    earnings: 0,
    rides: 0,
    hours: 0,
    rating: userData?.rating || 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationInterval, setLocationInterval] = useState(null);

  // Quick actions for drivers
  const quickActions = [
    { id: '1', icon: 'list', label: 'Available', screen: 'AvailableRides' },
    { id: '2', icon: 'trending-up', label: 'Earnings', screen: 'Earnings' },
    { id: '3', icon: 'clock', label: 'History', screen: 'RideHistory' },
  ];

  useEffect(() => {
    if (user?.uid) {
      loadTodayStats();
    }
  }, [user?.uid]);
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToDriverActiveRide(user.uid, (result) => {
      if (result.success) {
        setActiveRide(result.data);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const loadTodayStats = async () => {
    if (!user?.uid) return;

    setLoading(true);
    const result = await getDriverStats(user.uid, 'today');

    if (result.success) {
      setTodayStats(result.data);
    }

    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadTodayStats()]);
    setRefreshing(false);
  };

  const handleActiveRidePress = () => {
    navigation.navigate('ActiveRide', { ride: activeRide });
  };

  // Listen to profile changes (real-time)
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToDriverProfile(user.uid, (result) => {
      if (result.success) {
        setIsOnline(result.data.isOnline || false);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Handle toggle online/offline
  const handleToggleOnline = async (value) => {
    if (!user?.uid) return;

    setIsOnline(value);

    const result = await updateDriverStatus(user.uid, value);

    if (result.success) {
      if (value) {
        Alert.alert("You're Online! 🚗", 'You can now receive ride requests', [
          { text: 'OK' },
        ]);
        startLocationTracking();
      } else {
        Alert.alert("You're Offline", "You won't receive new ride requests", [
          { text: 'OK' },
        ]);
        stopLocationTracking();
      }
    } else {
      setIsOnline(!value);
      Alert.alert('Error', result.error);
    }
  };

  // Location tracking
  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location access is required to go online',
        );
        setIsOnline(false);
        return;
      }

      updateLocation();

      const interval = setInterval(() => {
        updateLocation();
      }, 10000);

      setLocationInterval(interval);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const stopLocationTracking = () => {
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
  };

  const updateLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      await updateDriverLocation(user.uid, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, []);

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
          />
        }
      >
        {/* Header - Matches Student */}
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <View
              style={[styles.statusDot, isOnline && styles.statusDotOnline]}
            />
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>
                {isOnline ? "You're Online" : "You're Offline"}
              </Text>
              <Text style={styles.distanceText}>
                {isOnline ? 'Ready to accept rides' : 'Tap to go online'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: COLORS.grayLight, true: '#008000' }}
              thumbColor={COLORS.white}
              style={{ transform: [{ scale: 0.8 }] }}
            />
          </View>

          <View style={styles.logoRow}>
            <Text style={styles.logoText}>Uniride</Text>
            {/* <Image source={logo} style={styles.logoIcon} /> */}
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Feather name="bell" size={20} color={COLORS.primary} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Active Ride Banner - Matches Student */}
        {activeRide ? (
          <ActiveRideBanner
            ride={activeRide}
            userRole="driver"
            onPress={handleActiveRidePress}
          />
        ) : (
          // Today's Earnings Card (when no active ride)
          <View style={styles.earningsCard}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <>
                <View style={styles.earningsHeader}>
                  <View>
                    <Text style={styles.earningsLabel}>Today's Earnings</Text>
                    <Text style={styles.earningsAmount}>
                      ₦{todayStats.earnings.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.earningsIcon}>
                    <Feather
                      name="trending-up"
                      size={24}
                      color={COLORS.success}
                    />
                  </View>
                </View>
                <View style={styles.earningsStats}>
                  <View style={styles.earningStat}>
                    <Text style={styles.earningStatValue}>
                      {todayStats.rides}
                    </Text>
                    <Text style={styles.earningStatLabel}>Rides</Text>
                  </View>
                  <View style={styles.earningStatDivider} />
                  <View style={styles.earningStat}>
                    <Text style={styles.earningStatValue}>
                      {todayStats.hours}h
                    </Text>
                    <Text style={styles.earningStatLabel}>Online</Text>
                  </View>
                  <View style={styles.earningStatDivider} />
                  <View style={styles.earningStat}>
                    <Text style={styles.earningStatValue}>
                      {todayStats.rating}
                    </Text>
                    <Text style={styles.earningStatLabel}>Rating</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}
        {/* Suggestions Header - Matches Student */}
        <View style={styles.suggestionsHeader}>
          <Text style={styles.suggestionsTitle}>Quick Actions</Text>
        </View>
        {/* Quick Actions Grid - Matches Student */}
        <View style={styles.suggestionsBox}>
          {quickActions.map((item) => (
            <TouchableOpacity key={item.id}>
              <SuggestionCard
                icon={item.icon}
                label={item.label}
                onPress={() => {
                  console.log(`${item.label} pressed`);
                  navigation.navigate(item.screen);
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
        {/* Performance Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Feather name="dollar-sign" size={20} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>
                ₦{todayStats.earnings.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Feather name="navigation" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{todayStats.rides}</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Feather name="clock" size={20} color={COLORS.info} />
              </View>
              <Text style={styles.statValue}>{todayStats.hours}h</Text>
              <Text style={styles.statLabel}>Online</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Feather name="star" size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>{todayStats.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>
        {/* Promo-style Call to Action */}
        {!isOnline && (
          <View style={styles.promoCard}>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Start Earning Today!</Text>
              <Text style={styles.promoSubtitle}>
                Go online and accept ride requests
              </Text>
            </View>
            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => handleToggleOnline(true)}
            >
              <Text style={styles.promoButtonText}>Go Online</Text>
              <Feather name="arrow-right" size={16} color={COLORS.background} />
            </TouchableOpacity>
          </View>
        )}
        {/* Recent Activity */}
        {todayStats.rides > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('RideHistory', { screen: 'RideHistory' })
                }
              >
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.activityCard}>
              <Feather name="check-circle" size={24} color={COLORS.success} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  {todayStats.rides} ride{todayStats.rides !== 1 ? 's' : ''}{' '}
                  completed today
                </Text>
                <Text style={styles.activitySubtitle}>
                  Great work! Keep it up
                </Text>
              </View>
            </View>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gray,
  },
  statusDotOnline: {
    backgroundColor: COLORS.success,
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
    flex: 1,
  },
  logoIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Earnings Card - Match SavedLocation style
  earningsCard: {
    backgroundColor: COLORS.darkGray,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  earningsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  earningStat: {
    alignItems: 'center',
  },
  earningStatValue: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  earningStatLabel: {
    fontSize: THEME.fontSize.xs,
    color: COLORS.gray,
  },
  earningStatDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  // Suggestions - Match student
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
  suggestionsBox: {
    marginBottom: 20,
    flexDirection: 'row',
    marginHorizontal: 'auto',
  },
  suggestionsContent: {
    paddingHorizontal: 20,
  },
  // Stats section
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
  },
  // Promo card - Match PromoCard style
  promoCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  promoButtonText: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.sm,
    fontWeight: 'bold',
  },
  // Activity card
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
  },
});

export default DriverHomeScreen;
