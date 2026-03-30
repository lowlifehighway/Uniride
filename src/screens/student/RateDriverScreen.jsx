// screens/student/RateDriverScreen.js

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { useAuth } from '../../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Quick feedback tags
const FEEDBACK_TAGS = [
  { id: 'on_time', label: 'On time', icon: 'clock' },
  { id: 'great_convo', label: 'Great chat', icon: 'message-circle' },
  { id: 'clean_vehicle', label: 'Clean vehicle', icon: 'star' },
  { id: 'safe_driving', label: 'Safe driving', icon: 'shield' },
  { id: 'knew_route', label: 'Knew the route', icon: 'map' },
  { id: 'friendly', label: 'Friendly', icon: 'smile' },
];

const BAD_TAGS = [
  { id: 'late', label: 'Arrived late', icon: 'clock' },
  { id: 'rude', label: 'Rude behavior', icon: 'frown' },
  { id: 'wrong_route', label: 'Wrong route', icon: 'map' },
  { id: 'dirty_vehicle', label: 'Dirty vehicle', icon: 'alert-circle' },
  { id: 'unsafe', label: 'Unsafe driving', icon: 'alert-triangle' },
];

const RateDriverScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { rideId } = route.params || {};
  const { user } = useAuth();

  // State
  const [rideData, setRideData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const starAnims = useRef(
    [1, 2, 3, 4, 5].map(() => new Animated.Value(1)),
  ).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardOpen(true),
    );
    const hideListener = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardOpen(false),
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // Fetch ride data
  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('rides')
      .doc(rideId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setRideData({ id: doc.id, ...doc.data() });
        }
        setLoading(false);
      });

    return () => unsubscribe();
  }, [rideId]);

  // Entrance animation
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  // Animate star on select
  const animateStar = (index) => {
    Animated.sequence([
      Animated.spring(starAnims[index], {
        toValue: 1.4,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(starAnims[index], {
        toValue: 1,
        tension: 200,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleStarPress = (value) => {
    setRating(value);
    animateStar(value - 1);

    // Reset tags when rating changes
    if (value >= 4) {
      setSelectedTags([]);
    } else {
      setSelectedTags([]);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 1:
        return { text: 'Very Poor', color: '#FF3B30' };
      case 2:
        return { text: 'Poor', color: '#FF9500' };
      case 3:
        return { text: 'Okay', color: '#FFCC00' };
      case 4:
        return { text: 'Good', color: '#34C759' };
      case 5:
        return { text: 'Excellent!', color: COLORS.primary };
      default:
        return { text: 'Tap a star to rate', color: COLORS.gray };
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please tap a star to rate your driver');
      return;
    }

    if (!rideId || !user?.uid) {
      Alert.alert('Error', 'Unable to submit rating');
      return;
    }

    setSubmitting(true);

    try {
      const driverId = rideData?.driverId;

      // 1. Save rating to rides collection
      await firestore()
        .collection('rides')
        .doc(rideId)
        .update({
          studentRating: rating,
          studentComment: comment.trim() || null,
          studentTags: selectedTags,
          ratedAt: firestore.FieldValue.serverTimestamp(),
          rated: true,
        });

      // 2. Save to ratings collection
      await firestore()
        .collection('ratings')
        .add({
          rideId,
          driverId,
          studentId: user.uid,
          rating,
          comment: comment.trim() || null,
          tags: selectedTags,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      // 3. Update driver's average rating
      if (driverId) {
        const ratingsSnapshot = await firestore()
          .collection('ratings')
          .where('driverId', '==', driverId)
          .get();

        const totalRatings = ratingsSnapshot.size;
        const totalScore = ratingsSnapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().rating || 0),
          0,
        );
        const avgRating = totalScore / totalRatings;
      }

      console.log('✅ Rating submitted successfully');

      // Show success animation
      setSubmitted(true);
      setSubmitting(false);

      Animated.spring(successAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }).start();

      // Navigate after delay
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home', params: { screen: 'HomeScreen' } }],
        });
      }, 2500);
    } catch (error) {
      console.error('❌ Error submitting rating:', error);
      setSubmitting(false);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Rating?',
      'Your feedback helps improve driver quality. Are you sure?',
      [
        { text: 'Rate Driver', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Home' } }],
            });
          },
        },
      ],
    );
  };

  // Loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Success state
  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />
        <Animated.View
          style={[
            styles.successContent,
            {
              opacity: successAnim,
              transform: [
                {
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.successIcon}>
            <Feather name="check" size={48} color={COLORS.white} />
          </View>
          <Text style={styles.successTitle}>Thanks for rating!</Text>
          <Text style={styles.successSubtitle}>
            Your feedback helps make Uniride better for everyone
          </Text>
          <View style={styles.successStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Feather
                key={star}
                name="star"
                size={28}
                color={star <= rating ? COLORS.primary : COLORS.darkGray}
                style={{ marginHorizontal: 4 }}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    );
  }

  const ratingInfo = getRatingLabel();
  const tags = rating >= 4 ? FEEDBACK_TAGS : rating > 0 ? BAD_TAGS : [];
  const driverName =
    rideData?.driver?.name || rideData?.driverName || 'Your Driver';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={
        Platform.OS === 'ios' ? 'padding' : keyboardOpen ? 'height' : undefined
      }
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            {/* Driver Avatar */}
            <View style={styles.driverSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Feather name="user" size={40} color={COLORS.primary} />
                </View>
                <View style={styles.avatarBadge}>
                  <Feather name="check" size={12} color={COLORS.white} />
                </View>
              </View>

              <Text style={styles.driverName}>{driverName}</Text>
              <Text style={styles.driverSubtitle}>
                {rideData?.driver?.vehicle ||
                  rideData?.driverVehicle ||
                  'Uniride Driver'}
              </Text>

              {/* Trip summary */}
              {rideData && (
                <View style={styles.tripSummary}>
                  <View style={styles.tripDetail}>
                    <Feather name="map-pin" size={14} color={COLORS.gray} />
                    <Text style={styles.tripDetailText} numberOfLines={1}>
                      {rideData.pickup?.name || 'Pickup'}
                    </Text>
                  </View>
                  <Feather name="arrow-right" size={14} color={COLORS.gray} />
                  <View style={styles.tripDetail}>
                    <Feather name="flag" size={14} color={COLORS.gray} />
                    <Text style={styles.tripDetailText} numberOfLines={1}>
                      {rideData.destination?.name || 'Destination'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Title */}
            <Text style={styles.title}>How was your ride?</Text>
            <Text style={styles.subtitle}>
              Rate your experience with {driverName.split(' ')[0]}
            </Text>

            {/* Stars */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Animated.View
                  key={star}
                  style={{ transform: [{ scale: starAnims[star - 1] }] }}
                >
                  <TouchableOpacity
                    onPress={() => handleStarPress(star)}
                    activeOpacity={0.7}
                    style={styles.starButton}
                  >
                    <Feather
                      name={star <= (hoveredStar || rating) ? 'star' : 'star'}
                      size={44}
                      color={
                        star <= rating
                          ? COLORS.primary
                          : star <= hoveredStar
                            ? COLORS.primary + '60'
                            : COLORS.darkGray
                      }
                    />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            {/* Rating label */}
            <Animated.View style={styles.ratingLabelContainer}>
              <Text style={[styles.ratingLabel, { color: ratingInfo.color }]}>
                {ratingInfo.text}
              </Text>
            </Animated.View>

            {/* Feedback Tags */}
            {tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.tagsSectionTitle}>
                  {rating >= 4 ? 'What went well?' : 'What went wrong?'}
                </Text>
                <View style={styles.tagsGrid}>
                  {tags.map((tag) => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tag,
                        selectedTags.includes(tag.id) && styles.tagSelected,
                      ]}
                      onPress={() => toggleTag(tag.id)}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name={tag.icon}
                        size={14}
                        color={
                          selectedTags.includes(tag.id)
                            ? COLORS.background
                            : COLORS.gray
                        }
                      />
                      <Text
                        style={[
                          styles.tagText,
                          selectedTags.includes(tag.id) &&
                            styles.tagTextSelected,
                        ]}
                      >
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Comment input */}
            {rating > 0 && (
              <View style={styles.commentSection}>
                <Text style={styles.commentLabel}>
                  Add a comment (optional)
                </Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder={
                    rating >= 4
                      ? 'Tell us what made your ride great...'
                      : 'Tell us what could be improved...'
                  }
                  placeholderTextColor={COLORS.gray}
                  multiline
                  numberOfLines={3}
                  value={comment}
                  onChangeText={setComment}
                  maxLength={300}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{comment.length}/300</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                rating === 0 && styles.submitButtonDisabled,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <Feather name="send" size={20} color={COLORS.background} />
                  <Text style={styles.submitButtonText}>Submit Rating</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Tip driver */}
            {rideData?.paymentMethod !== 'cash' && (
              <TouchableOpacity style={styles.tipButton}>
                <Feather name="dollar-sign" size={18} color={COLORS.primary} />
                <Text style={styles.tipButtonText}>
                  Add a tip for your driver
                </Text>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: COLORS.gray,
    fontSize: 16,
  },

  // Driver section
  driverSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary + '40',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  driverName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  driverSubtitle: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 12,
  },
  tripSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 8,
    maxWidth: '100%',
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  tripDetailText: {
    color: COLORS.gray,
    fontSize: 12,
    flex: 1,
  },

  // Title
  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 28,
  },

  // Stars
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  starButton: {
    padding: 8,
  },
  ratingLabelContainer: {
    alignItems: 'center',
    marginBottom: 28,
    minHeight: 24,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Tags
  tagsSection: {
    marginBottom: 24,
  },
  tagsSectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.darkGray,
    backgroundColor: COLORS.darkGray,
  },
  tagSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: COLORS.background,
    fontWeight: '600',
  },

  // Comment
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  commentInput: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 16,
    color: COLORS.white,
    fontSize: 15,
    minHeight: 90,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  charCount: {
    color: COLORS.gray,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },

  // Submit
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 25,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Tip
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  tipButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  // Success
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  successTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    color: COLORS.gray,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default RateDriverScreen;
