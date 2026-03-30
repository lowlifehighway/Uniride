import { Feather } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const RideCompleteScreen = ({ route, navigation }) => {
  const { ride, fare } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.successIcon}>
          <Feather name="check-circle" size={64} color={COLORS.success} />
        </View>
        <Text style={styles.title}>Ride Completed!</Text>
        <Text style={styles.subtitle}>Great job on completing this ride</Text>

        <View style={styles.fareCard}>
          <Text style={styles.fareLabel}>You Earned</Text>
          <Text style={styles.fareAmount}>
            ₦{Math.round((fare || 300) * 0.85).toLocaleString()}
          </Text>
          <Text style={styles.fareNote}>
            Platform fee: ₦{Math.round((fare || 300) * 0.15)}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('DriverHome')}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Earnings')}
          >
            <Text style={styles.secondaryButtonText}>View Earnings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  successIcon: { marginBottom: 24 },
  title: {
    fontSize: THEME.fontSize.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: THEME.fontSize.md,
    color: COLORS.gray,
    marginBottom: 32,
    textAlign: 'center',
  },
  fareCard: {
    backgroundColor: COLORS.white,
    width: '100%',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  fareLabel: {
    fontSize: THEME.fontSize.md,
    color: COLORS.gray,
    marginBottom: 8,
  },
  fareAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 8,
  },
  fareNote: { fontSize: THEME.fontSize.sm, color: COLORS.gray },
  actionsContainer: { width: '100%', gap: 12 },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    fontSize: THEME.fontSize.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default RideCompleteScreen;
