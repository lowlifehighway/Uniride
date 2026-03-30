import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import SearchBar from '../../components/Inputs/SearchBar';
import SavedLocation from '../../components/SavedLocation';
import SuggestionCard from '../../components/Cards/SuggestionCard';
import PromoCard from '../../components/Cards/PromoCard';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';

const FindingScreen = ({ navigation }) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulse animation for "Finding" badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Simulate finding a ride after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const suggestions = [
    { id: '1', icon: 'navigation', label: 'rides' },
    { id: '2', icon: 'package', label: 'Packages' },
    { id: '3', icon: 'calendar', label: 'Reserve' },
    { id: '4', icon: 'clock', label: 'Ongoing' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* Dimmed Background Content */}
        <View style={styles.dimmedContent}>
          <View style={styles.header}>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={20} color={COLORS.gray} />
              <Text style={[styles.locationText, styles.dimmed]}>
                BuCodel, Babcock
              </Text>
            </View>
            <View style={styles.logoRow}>
              <Text style={[styles.logoText, styles.dimmed]}>Uniride</Text>
            </View>
          </View>

          <SearchBar
            placeholder="Where to?"
            onPress={() => {}}
            onSchedulePress={() => {}}
          />

          <SavedLocation
            title="Emrald hall, babcock university"
            address="VP09+VPP, illishann 121103, ogun"
            onPress={() => {}}
          />

          <View style={styles.suggestionsHeader}>
            <Text style={[styles.suggestionsTitle, styles.dimmed]}>
              Suggestions
            </Text>
            <Text style={[styles.seeAllText, styles.dimmed]}>See all</Text>
          </View>

          <View style={styles.suggestionsRow}>
            {suggestions.map((item) => (
              <SuggestionCard
                key={item.id}
                icon={item.icon}
                label={item.label}
                size="small"
                onPress={() => {}}
              />
            ))}
          </View>

          <PromoCard
            title="Enjoy 40% off select rides"
            buttonText="book now"
            onPress={() => {}}
          />
        </View>

        {/* Finding Badge */}
        <Animated.View
          style={[styles.findingBadge, { transform: [{ scale: pulseAnim }] }]}
        >
          <Feather name="navigation" size={28} color={COLORS.background} />
          <Text style={styles.findingText}>Finding</Text>
        </Animated.View>
      </View>
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
  dimmedContent: {
    flex: 1,
    opacity: 0.4,
  },
  dimmed: {
    opacity: 0.5,
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
  locationText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.md,
    marginLeft: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.xxxl,
    fontWeight: 'bold',
  },
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
  suggestionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  findingBadge: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  findingText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default FindingScreen;
