// my splash screen — animation ported from web version
import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
  Image,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import logo from '../../assets/icon.png';

const { width, height } = Dimensions.get('window');

const APP_NAME = 'UniRide';
const LETTERS = APP_NAME.split('');

const SplashScreen = ({ navigation, setInitLoading }) => {
  const { user } = useAuth();

  // Master progress value (0 → 1) that drives everything, mirroring the web version
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Single spring-flavoured timing that goes 0 → 1 over ~3.5 s
    // React Native doesn't support custom cubic bezier on spring natively,
    // so we chain: fast ease-in pop (0→0.2) + slow ease-out settle (0.2→1)
    Animated.sequence([
      Animated.timing(progress, {
        toValue: 0.22, // "pop" phase
        duration: 500,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: false, // we need non-native for translateX on layout
      }),
      Animated.timing(progress, {
        toValue: 1, // "spread" phase
        duration: 2800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
    ]).start(handleFinish);
  }, []);

  const handleFinish = () => {
    if (user) {
      setInitLoading(false);
    } else {
      navigation.replace('Auth');
    }
  };

  // ─── Wheel derived values ────────────────────────────────────────────────

  // Scale: 0 → 1.2 between progress 0–0.15, then 1.2 → 1 between 0.15–0.2
  const wheelScale = progress.interpolate({
    inputRange: [0, 0.15, 0.2],
    outputRange: [0, 1.2, 1],
    extrapolate: 'clamp',
  });

  // Opacity: 0 → 1 between progress 0–0.05
  const wheelOpacity = progress.interpolate({
    inputRange: [0, 0.05],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Rotation: 0 → 1440 deg (4 full spins) over full progress
  const wheelRotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1440deg'],
  });

  // X offset: stays at 0 until progress 0.2, then moves right to +105
  const wheelX = progress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0, 105],
    extrapolate: 'clamp',
  });

  // ─── Text container derived values ───────────────────────────────────────

  // Moves left to -25 as wheel moves right
  const textX = progress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0, -25],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Center row: text + wheel */}
      <View style={styles.row}>
        {/* Text container — slides left */}
        <Animated.View
          style={[styles.textContainer, { transform: [{ translateX: textX }] }]}
        >
          {LETTERS.map((letter, index) => {
            // Each letter appears between progress 0.3 + index*0.08 and that + 0.1
            const start = 0.3 + index * 0.08;
            const end = start + 0.1;

            const letterOpacity = progress.interpolate({
              inputRange: [start, end],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            });

            const letterScale = progress.interpolate({
              inputRange: [start, end],
              outputRange: [0.5, 1],
              extrapolate: 'clamp',
            });

            const letterX = progress.interpolate({
              inputRange: [start, end],
              outputRange: [10, 0],
              extrapolate: 'clamp',
            });

            return (
              <Animated.Text
                key={index}
                style={[
                  styles.letter,
                  {
                    opacity: letterOpacity,
                    transform: [
                      { scale: letterScale },
                      { translateX: letterX },
                    ],
                  },
                ]}
              >
                {letter}
              </Animated.Text>
            );
          })}
        </Animated.View>

        {/* Wheel — slides right, spins, pops in */}
        <Animated.View
          style={[
            styles.wheelContainer,
            {
              opacity: wheelOpacity,
              transform: [
                { translateX: wheelX },
                { rotate: wheelRotate },
                { scale: wheelScale },
              ],
            },
          ]}
        >
          <Image source={logo} style={styles.wheelImage} />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  letter: {
    color: COLORS.primary,
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 48,
  },
  wheelContainer: {
    position: 'absolute',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
