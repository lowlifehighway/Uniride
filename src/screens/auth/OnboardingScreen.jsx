import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import image1 from '../../../assets/keke-image-1.png';
import image2 from '../../../assets/keke-image-2.png';

const { width, height } = Dimensions.get('window');

const CARD_OVERLAP = 28; // how many px the card overlaps up into the image
const IMAGE_HEIGHT = height * 0.55 + CARD_OVERLAP;

const OnboardingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const slides = [
    {
      id: '1',
      title: 'Welcome to UNIride',
      description:
        'your stress-free campus ride partner\nSafe, affordable rides – built for\nstudents, by students',
      image: image1,
    },
    {
      id: '2',
      title: 'Safety & Simplicity',
      description:
        'Book a Keke instantly, anywhere on\ncampus\nFriendly Keke driver waiting',
      image: image2,
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('IntroScreen');
    }
  };

  const handleSkip = () => {
    navigation.navigate('IntroScreen');
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Image Carousel — top portion */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
      />

      {/* Bottom Card */}
      <View style={[styles.card, { paddingBottom: insets.bottom + 20 }]}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Text */}
        <Text style={styles.title}>{slides[currentIndex].title}</Text>
        <Text style={styles.description}>
          {slides[currentIndex].description}
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
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
  flatList: {
    height: IMAGE_HEIGHT,
    flexGrow: 0,
  },
  slide: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // ── Bottom card ──────────────────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 30,
    marginTop: -CARD_OVERLAP,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  // ── Pagination ────────────────────────────────────────────────────────────
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 28,
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: COLORS.white,
    opacity: 0.5,
  },

  // ── Text ─────────────────────────────────────────────────────────────────
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },
  description: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.85,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto',
    paddingTop: 24,
  },
  skipButton: {
    flex: 1,
    marginRight: 12,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  skipText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
