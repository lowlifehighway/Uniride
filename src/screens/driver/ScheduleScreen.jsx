import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { getDriverProfile } from '../../services/driver';

const ScheduleScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    if (!user?.uid) return;

    setLoading(true);
    const result = await getDriverProfile(user.uid);

    if (result.success) {
      console.log('✅ Loaded schedule');
      setSchedule(result.data.schedule || {});
    }

    setLoading(false);
  };

  const daySchedule = schedule[selectedDay] || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Availability')}>
          <Feather name="edit-2" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.daysContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
        >
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDay === day && styles.dayButtonActive,
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDay === day && styles.dayTextActive,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{selectedDay} Schedule</Text>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : daySchedule.length > 0 ? (
            daySchedule.map((slot, index) => (
              <View key={index} style={styles.slotCard}>
                <Feather name="clock" size={20} color={COLORS.primary} />
                <Text style={styles.slotTime}>
                  {slot.start} - {slot.end}
                </Text>
                <Text style={styles.slotDuration}>
                  {parseInt(slot.end.split(':')[0]) -
                    parseInt(slot.start.split(':')[0])}
                  h
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="calendar-x" size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>No schedule for this day</Text>
            </View>
          )}
        </View>
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
  daysContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  daysScroll: { paddingHorizontal: 20, gap: 8 },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
  },
  dayButtonActive: { backgroundColor: COLORS.primary },
  dayText: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.gray,
  },
  dayTextActive: { color: COLORS.white },
  section: { padding: 20 },
  sectionTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  slotTime: {
    flex: 1,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  slotDuration: { fontSize: THEME.fontSize.md, color: COLORS.gray },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: THEME.fontSize.md, color: COLORS.gray, marginTop: 12 },
});

export default ScheduleScreen;
