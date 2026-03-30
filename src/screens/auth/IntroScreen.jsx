import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Logo from '../../../assets/icon-black.png';

const IntroScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.primary} />

        <View style={styles.container}>
          <View style={styles.content}>
            <Text>{''}</Text>
            <View style={styles.welcomeSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>Uniride</Text>
                <Image source={Logo} style={styles.logoImage} />
              </View>
              <Text style={styles.welcomeTitle}>Tap. Ride. Arrive.</Text>
            </View>
            <View style={styles.bottomContainer}>
              <View style={styles.textContainer}>
                <Text style={styles.text}>Welcome</Text>
                <Text style={styles.subText}>
                  Get started with your account
                </Text>
              </View>
              <View
                style={[
                  styles.buttonContiner,
                  { paddingBottom: insets.bottom },
                ]}
              >
                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.signUpButtonText}>Get Started</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.signInButtonText}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    color: COLORS.background,
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  welcomeSection: {
    alignItems: 'center',
  },
  welcomeTitle: {
    color: COLORS.background,
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
  },
  bottomContainer: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 16,
    gap: 48,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: COLORS.background,
  },
  tutorialButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  tutorialButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
  },
  textContainer: { gap: 12, alignItems: 'center' },
  text: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xxl,
  },
  subText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
  },
  buttonContiner: { gap: 24 },
  signUpButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: THEME.borderRadius.small,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
  },
  signInButton: {
    backgroundColor: COLORS.darkGray,
    paddingVertical: 16,
    borderRadius: THEME.borderRadius.small,
    alignItems: 'center',
  },
  signInButtonText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
  },
});

export default IntroScreen;
