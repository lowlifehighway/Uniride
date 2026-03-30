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

// Import Firebase service
import { getTransactions } from '../../services/earnings';

const TransactionsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'ride', label: 'Rides' },
    { id: 'withdrawal', label: 'Withdrawals' },
    { id: 'bonus', label: 'Bonuses' },
  ];

  useEffect(() => {
    loadTransactions();
  }, [selectedFilter]);

  const loadTransactions = async () => {
    if (!user?.uid) return;

    setLoading(true);
    const result = await getTransactions(user.uid, selectedFilter, 100);

    if (result.success) {
      setTransactions(result.data);
    }

    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const formatDate = (timestamp) => {
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
      year: 'numeric',
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'ride':
        return { name: 'navigation', color: COLORS.success };
      case 'withdrawal':
        return { name: 'download', color: COLORS.error };
      case 'bonus':
        return { name: 'gift', color: COLORS.warning };
      default:
        return { name: 'dollar-sign', color: COLORS.primary };
    }
  };

  const getTransactionTitle = (transaction) => {
    switch (transaction.type) {
      case 'ride':
        return 'Ride Earnings';
      case 'withdrawal':
        return 'Withdrawal';
      case 'bonus':
        return transaction.reason || 'Bonus';
      default:
        return 'Transaction';
    }
  };

  const renderTransaction = (transaction) => {
    const icon = getTransactionIcon(transaction.type);
    const isNegative = transaction.type === 'withdrawal';

    return (
      <TouchableOpacity
        key={transaction.id}
        style={styles.transactionCard}
        onPress={() =>
          navigation.navigate('TransactionDetails', { transaction })
        }
        activeOpacity={0.7}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}
        >
          <Feather name={icon.name} size={18} color={icon.color} />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>
            {getTransactionTitle(transaction)}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.createdAt)}
          </Text>
          {transaction.status && (
            <View
              style={[
                styles.statusBadge,
                transaction.status === 'completed' &&
                  styles.statusBadgeCompleted,
                transaction.status === 'pending' && styles.statusBadgePending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  transaction.status === 'completed' &&
                    styles.statusTextCompleted,
                  transaction.status === 'pending' && styles.statusTextPending,
                ]}
              >
                {transaction.status}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.transactionAmount,
            isNegative && styles.transactionAmountNegative,
          ]}
        >
          {isNegative ? '-' : '+'}₦
          {Math.abs(transaction.amount).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  // Group transactions by month
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.createdAt?.toDate
      ? transaction.createdAt.toDate()
      : new Date(transaction.createdAt);
    const monthYear = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(transaction);
    return groups;
  }, {});

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
            <Text style={styles.greeting}>Transactions</Text>
            <Text style={styles.subtitle}>
              {transactions.length} transaction
              {transactions.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
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
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Transactions List */}
        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 40 }}
            />
          ) : transactions.length > 0 ? (
            Object.entries(groupedTransactions).map(
              ([monthYear, monthTransactions]) => (
                <View key={monthYear} style={styles.monthGroup}>
                  <Text style={styles.monthHeader}>{monthYear}</Text>
                  {monthTransactions.map(renderTransaction)}
                </View>
              ),
            )
          ) : (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={64} color={COLORS.gray} />
              <Text style={styles.emptyTitle}>No Transactions</Text>
              <Text style={styles.emptyText}>
                Your transactions will appear here
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
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  listContainer: { paddingHorizontal: 20 },
  monthGroup: { marginBottom: 24 },
  monthHeader: {
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
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
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: { flex: 1 },
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  statusBadgeCompleted: {
    backgroundColor: COLORS.success + '20',
  },
  statusBadgePending: {
    backgroundColor: COLORS.warning + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusTextCompleted: {
    color: COLORS.success,
  },
  statusTextPending: {
    color: COLORS.warning,
  },
  transactionAmount: {
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  transactionAmountNegative: {
    color: COLORS.error,
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

export default TransactionsScreen;
