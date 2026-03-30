import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const ServicesScreen = ({ navigation }) => {
  const rideServices = [
    { id: '1', icon: 'navigation', label: 'rides' },
    { id: '2', icon: 'calendar', label: 'Reserve' },
    { id: '3', icon: 'clock', label: 'Ongoing' },
  ];

  const courierServices = [
    { id: '1', icon: 'package', label: 'Packages' },
    // { id: '2', icon: 'calendar', label: 'Reserve' },
  ];

  const ServiceCard = ({ icon, label }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => {
        if (label === 'Packages') {
          navigation.navigate('RidePlan', { mode: 'courier' });
        } else {
          navigation.navigate('RidePlan', { mode: 'ride' });
        }
      }}
    >
      <View style={styles.serviceIconCircle}>
        <Feather name={icon} size={32} color={COLORS.white} />
      </View>
      <View style={styles.serviceLabelContainer}>
        <Text style={styles.serviceLabelText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>services</Text>
            <Text style={styles.subtitle}>
              Go anywhere round your Uni anytime
            </Text>
          </View>

          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroTextSection}>
                <View>
                  <Text style={styles.heroTitle}>
                    Hop in, ride easy{' '}
                    <Image
                      source={require('../../../assets/dash-tire.png')}
                      style={{
                        position: 'absolute',
                        width: 30,
                        height: 30,
                        left: 0,
                      }}
                    />
                  </Text>
                </View>
                <Text style={styles.heroDescription}>
                  Join ride in seconds, connect with fellow students, and get to
                  class faster.
                </Text>
              </View>
              <View style={styles.heroImageSection}>
                {/* Replace with actual image */}
                <Image source={require('../../../assets/services-image.png')} />
              </View>
            </View>
          </View>

          {/* Get a ride section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get a ride</Text>
            <View style={styles.servicesRow}>
              {rideServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  icon={service.icon}
                  label={service.label}
                />
              ))}
            </View>
          </View>

          {/* Get Courier section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get Courier to help</Text>
            <View style={styles.servicesRow}>
              {courierServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  icon={service.icon}
                  label={service.label}
                  onPress={() => console.log(`${service.label} pressed`)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
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
    paddingTop: 20,
    marginBottom: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: '500',
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 30,
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
  },
  heroTextSection: {
    flex: 1.2,
    paddingLeft: 16,
    paddingVertical: 16,
  },
  heroTitle: {
    color: COLORS.background,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    position: 'relative',
  },
  heroDescription: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    lineHeight: 20,
  },
  heroImageSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  serviceCard: {
    position: 'relative',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 15,
    width: 100,
  },
  serviceIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceLabelContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  serviceLabelText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.sm,
    fontWeight: 'bold',
  },
});

export default ServicesScreen;
