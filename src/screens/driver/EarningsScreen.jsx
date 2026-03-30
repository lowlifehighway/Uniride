import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { useAuth } from '../../hooks/useAuth';

// Import Firebase services
import {
  getDriverEarnings,
  getDriverStatistics,
  getRecentTransactions,
} from '../../services/earnings';

const EarningsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Firebase data
  const [earnings, setEarnings] = useState({
    available: 0,
    pending: 0,
    total: 0,
  });

  const [stats, setStats] = useState({
    today: { rides: 0, earnings: 0, hours: 0 },
    week: { rides: 0, earnings: 0, hours: 0 },
    month: { rides: 0, earnings: 0, hours: 0 },
  });

  const [recentTransactions, setRecentTransactions] = useState([]);

  // Load data on mount
  useEffect(() => {
    if (user?.uid) {
      loadAllData();
    }
  }, [user?.uid]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadEarnings(), loadStatistics(), loadTransactions()]);
    setLoading(false);
  };

  const loadEarnings = async () => {
    const result = await getDriverEarnings(user.uid);
    if (result.success) {
      setEarnings(result.data);
    }
  };

  const loadStatistics = async () => {
    const result = await getDriverStatistics(user.uid);
    if (result.success) {
      setStats(result.data);
    }
  };

  const loadTransactions = async () => {
    const result = await getRecentTransactions(user.uid, 10);
    if (result.success) {
      setRecentTransactions(result.data);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
  ];

  const currentStats = stats[selectedPeriod];

  const formatTransactionDate = (timestamp) => {
    if (!timestamp) return 'Unknown';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        {/* Header - Matches Student Style */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Your Earnings</Text>
              <Text style={styles.balanceAmount}>
                ₦{earnings.available.toLocaleString()}
              </Text>
              <Text style={styles.balanceSubtext}>
                ₦{earnings.pending.toLocaleString()} pending
              </Text>
            </View>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => navigation.navigate('Transactions')}
            >
              <Feather name="list" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: COLORS.primary,
                },
              ]}
              onPress={() =>
                navigation.navigate('Withdraw', { balance: earnings.available })
              }
            >
              <Feather name="download" size={18} color={COLORS.background} />
              <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: COLORS.background },
              ]}
              onPress={() => navigation.navigate('EarningsDetails')}
            >
              <Feather name="bar-chart-2" size={24} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.white }]}>
                Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Period Selector - Chip Style */}
        <View style={styles.periodContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodScroll}
          >
            {periods.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodChip,
                  selectedPeriod === period.id && styles.periodChipActive,
                ]}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Text
                  style={[
                    styles.periodText,
                    selectedPeriod === period.id && styles.periodTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Feather name="dollar-sign" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>
                ₦{currentStats.earnings.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Feather name="navigation" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{currentStats.rides}</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Feather name="clock" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{currentStats.hours}h</Text>
              <Text style={styles.statLabel}>Online</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Feather name="trending-up" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>
                ₦
                {currentStats.rides > 0
                  ? Math.round(currentStats.earnings / currentStats.rides)
                  : 0}
              </Text>
              <Text style={styles.statLabel}>Per Ride</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Transactions')}
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Complete rides to start earning
              </Text>
            </View>
          ) : (
            recentTransactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View
                  style={[
                    styles.transactionIcon,
                    transaction.type === 'withdrawal' &&
                      styles.transactionIconWithdrawal,
                  ]}
                >
                  <Feather
                    name={
                      transaction.type === 'ride' ? 'navigation' : 'download'
                    }
                    size={18}
                    color={
                      transaction.type === 'ride'
                        ? COLORS.success
                        : COLORS.error
                    }
                  />
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {transaction.type === 'ride'
                      ? 'Ride Earnings'
                      : 'Withdrawal'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatTransactionDate(transaction.createdAt)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.type === 'withdrawal' &&
                      styles.transactionAmountNegative,
                  ]}
                >
                  {transaction.type === 'ride' ? '+' : '-'}₦
                  {transaction.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Summary Card */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Earned</Text>
              <Text style={styles.summaryValue}>
                ₦{earnings.total.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Available</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                ₦{earnings.available.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
                ₦{earnings.pending.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.md,
  },
  // Header - Matches Student HomeScreen
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.md,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: -1,
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderColor: COLORS.primary,
    borderWidth: 1,
    gap: 8,
    width: '50%',
  },
  withdrawButtonText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  periodContainer: {
    marginBottom: 20,
  },
  periodScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodText: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
    fontWeight: '600',
  },
  periodTextActive: {
    color: COLORS.background,
  },
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
    color: COLORS.white,
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
    backgroundColor: COLORS.darkGray,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
    marginTop: 4,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconWithdrawal: {
    backgroundColor: COLORS.error + '20',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: THEME.fontSize.xs,
    color: COLORS.gray,
  },
  transactionAmount: {
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  transactionAmountNegative: {
    color: COLORS.error,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: COLORS.darkGray,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: THEME.fontSize.md,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  actionText: {
    fontSize: THEME.fontSize.xs,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default EarningsScreen;
