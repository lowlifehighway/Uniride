import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const PromotionScreen = ({ navigation }) => {
  const promotion = {
    title: 'Enjoy 40% off your next 2 rides, up to NGN 787 per ride.',
    expires: 'Aug 26, 2025',
    terms: ['Not valid for rides on .', 'Up to NGN 787 per ride.'],
    disclaimer: [
      'Discount does not apply to surcharges, government fees, tolls, or tips and cannot be combined with other offers.',
      '',
      "For accounts with multiple valid promo codes, the promo with the highest savings will automatically apply to a rider's next trip. Offer is non-transferable.",
      '',
      'Offer and terms are subject to change.',
    ],
  };

  const handleBookNow = () => {
    navigation.navigate('ServicesScreen', {
      screen: 'RidePlan',
      params: { mode: 'ride' },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.topContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={28} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.title}>Promotion</Text>

            {/* Promotion Details */}
            <View style={styles.content}>
              <Text style={styles.offerText}>{promotion.title}</Text>

              <Text style={styles.expiresText}>
                Expires {promotion.expires}
              </Text>

              {/* Terms List */}
              <View style={styles.termsList}>
                {promotion.terms.map((term, index) => (
                  <View key={index} style={styles.termItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.termText}>{term}</Text>
                  </View>
                ))}
              </View>

              {/* Disclaimer */}
              <View style={styles.disclaimer}>
                {promotion.disclaimer.map((line, index) => (
                  <Text key={index} style={styles.disclaimerText}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Content */}
        <View style={styles.bottomContainer}>
          <View style={styles.bottomContent}>
            {/* Best Deal Banner */}
            <View style={styles.bestDealBanner}>
              <Text style={styles.bestDealText}>
                We'll apply your best deal
              </Text>
              <View style={styles.bestDealIcon}>
                <Text style={styles.iconEmoji}>🛺</Text>
              </View>
            </View>

            {/* Book Now Button */}
            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleBookNow}
              activeOpacity={0.8}
            >
              <Text style={styles.bookButtonText}>Book now</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 160 : 140, // Space for fixed bottom content
  },
  topContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 16,
  },
  title: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  offerText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    lineHeight: 32,
    marginBottom: 20,
    fontWeight: '600',
  },
  expiresText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  termsList: {
    marginBottom: 24,
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    marginRight: 12,
    marginTop: 2,
  },
  termText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    flex: 1,
    lineHeight: 24,
  },
  disclaimer: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  disclaimerText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
    lineHeight: 20,
    marginBottom: 12,
  },
  bottomContainer: {
    width: '100%',
    backgroundColor: COLORS.background,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  bottomContent: {
    paddingHorizontal: 20,
  },
  bestDealBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.background,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bestDealText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    flex: 1,
    letterSpacing: 0.3,
  },
  bestDealIcon: {
    width: 44,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default PromotionScreen;
