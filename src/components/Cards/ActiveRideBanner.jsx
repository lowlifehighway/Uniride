import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const ActiveRideBanner = ({ ride, userRole, onPress }) => {
  console.log(ride.status);
  const getStatusText = () => {
    if (userRole === 'driver') {
      switch (ride.status) {
        case 'accepted':
          return 'Heading to pickup';
        case 'inProgress':
          return 'Ride in progress';
        default:
          return 'Active ride';
      }
    } else {
      switch (ride.status) {
        case 'pending':
          return 'Finding driver...';
        case 'accepted':
          return 'Driver on the way';
        case 'inProgress':
          return 'On your way';
        default:
          return 'Active ride';
      }
    }
  };

  const getStatusColor = () => {
    switch (ride.status) {
      case 'pending':
        return COLORS.warning;
      case 'accepted':
        return COLORS.primary;
      case 'inProgress':
        return COLORS.lightGreen;
      default:
        return COLORS.primary;
    }
  };

  const getDestinationText = () => {
    if (userRole === 'driver' && ride.status === 'accepted') {
      return ride.pickup?.name || 'Pickup location';
    }
    return ride.destination?.name || 'Destination';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: getStatusColor() }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Status Indicator */}
      <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]}>
        <Feather name="navigation" size={14} color={COLORS.white} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          <View style={styles.pulseContainer}>
            <View
              style={[styles.pulse, { backgroundColor: getStatusColor() }]}
            />
          </View>
        </View>

        <View style={styles.routeInfo}>
          <Feather name="map-pin" size={14} color={COLORS.gray} />
          <Text style={styles.destination} numberOfLines={1}>
            {getDestinationText()}
          </Text>
        </View>

        {userRole === 'student' && ride.driver && (
          <View style={styles.driverInfo}>
            <Feather name="user" size={12} color={COLORS.gray} />
            <Text style={styles.driverName} numberOfLines={1}>
              {ride.driver.name}
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.vehicle} numberOfLines={1}>
              {ride.driver.vehicle}
            </Text>
          </View>
        )}

        {userRole === 'driver' && ride.studentName && (
          <View style={styles.driverInfo}>
            <Feather name="user" size={12} color={COLORS.gray} />
            <Text style={styles.driverName} numberOfLines={1}>
              {ride.studentName}
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.fare}>₦{ride.fare}</Text>
          </View>
        )}
      </View>

      {/* Arrow */}
      <Feather name="chevron-right" size={24} color={getStatusColor()} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 2,
    gap: 12,
  },
  statusDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pulseContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  destination: {
    color: COLORS.white,
    fontSize: 14,
    flex: 1,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    color: COLORS.gray,
    fontSize: 12,
  },
  separator: {
    color: COLORS.gray,
    fontSize: 12,
  },
  vehicle: {
    color: COLORS.gray,
    fontSize: 12,
    flex: 1,
  },
  fare: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ActiveRideBanner;
