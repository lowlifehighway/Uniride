import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

// ✅ Import Firebase services
import { getMaintenanceRecords } from '../../services/driver';

const MaintenanceScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    if (!user?.uid) return;

    setLoading(true);
    const result = await getMaintenanceRecords(user.uid);

    if (result.success) {
      console.log('✅ Loaded maintenance records:', result.data.length);
      setRecords(result.data);
    }

    setLoading(false);
  };

  const handleAddRecord = () => {
    Alert.alert('Add Record', 'Add maintenance record feature coming soon');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maintenance</Text>
        <TouchableOpacity onPress={handleAddRecord}>
          <Feather name="plus" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : records.length > 0 ? (
          records.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordIcon}>
                <Feather name="tool" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordType}>{record.type}</Text>
                <Text style={styles.recordDetails}>
                  {record.date} • {record.mileage}
                </Text>
              </View>
              <Text style={styles.recordCost}>
                ₦{record.cost.toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="tool" size={64} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>No Maintenance Records</Text>
            <Text style={styles.emptyText}>
              Track your vehicle maintenance here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: { flex: 1 },
  recordType: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  recordDetails: { fontSize: THEME.fontSize.sm, color: COLORS.gray },
  recordCost: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: THEME.fontSize.md,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default MaintenanceScreen;
