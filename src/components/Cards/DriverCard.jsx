import { View, Text, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const DriverCard = ({ name, vehicle, distance, time, charge, profilePic }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver 🛺</Text>
      </View>

      <View style={styles.driverInfo}>
        <View style={styles.avatarContainer}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={32} color={COLORS.gray} />
            </View>
          )}
        </View>

        <View style={styles.driverDetails}>
          <Text style={styles.driverName}>{name}</Text>
          <Text style={styles.vehicleInfo}>{vehicle}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Feather name="navigation" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{distance}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Feather name="clock" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{time}</Text>
          <Text style={styles.statLabel}>Average Time</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Feather name="credit-card" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{charge}</Text>
          <Text style={styles.statLabel}>Charge</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicleInfo: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.darkGray,
    fontSize: THEME.fontSize.xs,
    textAlign: 'center',
  },
});

export default DriverCard;
