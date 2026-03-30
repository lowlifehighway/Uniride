import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { useAuth } from '../../hooks/useAuth';
import { getDailyEarningsBreakdown } from '../../services/earnings';

const EarningsDetailsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const periods = [
    { id: 'week', label: 'Week', days: 7 },
    { id: 'month', label: 'Month', days: 30 },
  ];

  useEffect(() => {
    loadEarningsData();
  }, [selectedPeriod]);

  const loadEarningsData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    const selectedPeriodObj = periods.find((p) => p.id === selectedPeriod);
    const days = selectedPeriodObj?.days || 7;
    const result = await getDailyEarningsBreakdown(user.uid, days);

    if (result.success) {
      setDailyData(result.data);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEarningsData();
    setRefreshing(false);
  };

  const maxEarnings =
    dailyData.length > 0 ? Math.max(...dailyData.map((d) => d.earnings)) : 1;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Earnings Details</Text>
            <Text style={styles.subtitle}>Daily breakdown</Text>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
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

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : dailyData.length > 0 ? (
          <>
            {/* Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Daily Earnings Chart</Text>
              <View style={styles.chart}>
                {dailyData.slice(-7).map((item, index) => (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${(item.earnings / maxEarnings) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{item.day}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Breakdown List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Breakdown</Text>
              {dailyData.map((item, index) => (
                <View key={index} style={styles.breakdownCard}>
                  <View style={styles.dayCircle}>
                    <Text style={styles.dayText}>{item.day}</Text>
                  </View>
                  <View style={styles.breakdownInfo}>
                    <Text style={styles.breakdownRides}>
                      {item.rides} ride{item.rides !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={styles.breakdownEarnings}>
                    ₦{item.earnings.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Feather name="bar-chart-2" size={64} color={COLORS.gray} />
            </View>
            <Text style={styles.emptyTitle}>No Data</Text>
            <Text style={styles.emptyText}>
              Complete rides to see earnings breakdown
            </Text>
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
  subtitle: { fontSize: THEME.fontSize.md, color: COLORS.gray },
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
  periodContainer: { marginBottom: 20 },
  periodScroll: { paddingHorizontal: 20, gap: 8 },
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
  periodTextActive: { color: COLORS.background },
  chartContainer: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    height: 180,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barContainer: { flex: 1, alignItems: 'center' },
  barWrapper: { flex: 1, width: '80%', justifyContent: 'flex-end' },
  bar: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    width: '100%',
    minHeight: 8,
  },
  barLabel: {
    fontSize: THEME.fontSize.xs,
    color: COLORS.gray,
    marginTop: 8,
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  breakdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dayText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  breakdownInfo: { flex: 1 },
  breakdownRides: { fontSize: THEME.fontSize.sm, color: COLORS.gray },
  breakdownEarnings: {
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: THEME.fontSize.md,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default EarningsDetailsScreen;
