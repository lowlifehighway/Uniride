import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { loginUserPhone, loginUserEmail } from '../../services/auth';
import {
  getFCMToken,
  setupTokenRefreshListener,
} from '../../services/pushNotifications';
import logoBlack from '../../../assets/icon-black.png';
import { useAuth } from '../../hooks/useAuth';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { userRole } = useAuth();
  const insets = useSafeAreaInsets();
  const [loginMethod, setLoginMethod] = useState('email'); // Default to email
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFocused, setIsFocused] = useState({
    email: false,
    phone: false,
    password: false,
  });
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const capitalize = (str) =>
    str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase();

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

  // Validation functions

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (errors.email) {
      setErrors({ ...errors, email: null });
    }
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
    if (errors.phone) {
      setErrors({ ...errors, phone: null });
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (errors.password) {
      setErrors({ ...errors, password: null });
    }
  };

  const handleSignIn = async () => {
    // Clear previous errors
    setErrors({});

    if (loginMethod === 'email') {
      // Validate email login
      const newErrors = {};

      if (!email || email.trim().length === 0) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!password || password.trim().length === 0) {
        newErrors.password = 'Password is required';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setLoading(true);
      try {
        const result = await loginUserEmail(email.trim(), password);

        if (result.success) {
          console.log('✅ Email login successful', result);
          console.log('the user role is', userRole);
          if (result.user?.uid) {
            try {
              await getFCMToken(result.user.uid); // ← Use result.user.uid
              setupTokenRefreshListener(result.user.uid); // ← Use result.user.uid
              console.log('✅ FCM token setup complete');
            } catch (fcmError) {
              // Don't block login if FCM fails
              console.error('⚠️ FCM token setup failed:', fcmError);
            }
          }
          // Success - AuthContext handles navigation
        } else {
          Alert.alert('Sign In Failed', result.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (loginMethod === 'phone') {
      // Validate phone login
      const newErrors = {};

      if (!phone || phone.trim().length === 0) {
        newErrors.phone = 'Phone number is required';
      } else if (!validatePhone(phone)) {
        newErrors.phone =
          'Please enter a valid phone number (e.g., +2349012345678)';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setLoading(true);
      try {
        const result = await loginUserPhone(phone.trim());

        if (result.success) {
          // Navigate to phone verification screen
          navigation.navigate('VerifyCode', {
            phone: phone.trim(),
            confirmation: result.confirmation,
            mode: 'login',
          });
        } else {
          Alert.alert('Phone Login Failed', result.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={
        Platform.OS === 'ios' ? 'padding' : keyboardOpen ? 'height' : undefined
      }
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={COLORS.primary}
          />

          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>UniRide</Text>
                <Image source={logoBlack} style={styles.logo} />
              </View>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={loading}
              >
                <Feather name="x" size={32} color={COLORS.background} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Sign in to your account</Text>
            </View>
          </View>
          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Form */}
            <View style={styles.form}>
              {/* Login Method Toggle */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    loginMethod === 'email' && styles.toggleButtonActive,
                  ]}
                  onPress={() => setLoginMethod('email')}
                  disabled={loading}
                >
                  <Feather
                    name="mail"
                    size={18}
                    color={loginMethod === 'email' ? COLORS.white : COLORS.gray}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      loginMethod === 'email' && styles.toggleTextActive,
                    ]}
                  >
                    Email
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    loginMethod === 'phone' && styles.toggleButtonActive,
                  ]}
                  onPress={() => setLoginMethod('phone')}
                  disabled={loading}
                >
                  <Feather
                    name="phone"
                    size={18}
                    color={loginMethod === 'phone' ? COLORS.white : COLORS.gray}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      loginMethod === 'phone' && styles.toggleTextActive,
                    ]}
                  >
                    Phone
                  </Text>
                </TouchableOpacity>
              </View>

              {loginMethod === 'email' ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={[
                        styles.input,
                        isFocused.email && styles.inputFocused,
                        errors.email && styles.inputError,
                      ]}
                      placeholder="Enter your email"
                      placeholderTextColor={COLORS.gray}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={handleEmailChange}
                      onFocus={() => handleFocus('email')}
                      onBlur={() => handleBlur('email')}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      editable={!loading}
                    />
                    {errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[
                          styles.input,
                          styles.passwordInput,
                          isFocused.password && styles.inputFocused,
                          errors.password && styles.inputError,
                        ]}
                        placeholder="Enter your password"
                        placeholderTextColor={COLORS.gray}
                        secureTextEntry={!isPasswordVisible}
                        value={password}
                        onChangeText={handlePasswordChange}
                        onFocus={() => handleFocus('password')}
                        onBlur={() => handleBlur('password')}
                        returnKeyType="done"
                        onSubmitEditing={handleSignIn}
                        editable={!loading}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        disabled={loading}
                      >
                        <Feather
                          name={isPasswordVisible ? 'eye' : 'eye-off'}
                          size={20}
                          color={
                            isFocused.password ? COLORS.primary : COLORS.gray
                          }
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => navigation.navigate('ForgotPassword')}
                    disabled={loading}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.signInButton,
                      (!email || !password || loading) &&
                        styles.signInButtonDisabled,
                    ]}
                    onPress={handleSignIn}
                    disabled={!email || !password || loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.background} />
                    ) : (
                      <Text style={styles.signInButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                      style={[
                        styles.input,
                        isFocused.phone && styles.inputFocused,
                        errors.phone && styles.inputError,
                      ]}
                      placeholder="+234 901 234 5678"
                      placeholderTextColor={COLORS.gray}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={phone}
                      onChangeText={handlePhoneChange}
                      onFocus={() => handleFocus('phone')}
                      onBlur={() => handleBlur('phone')}
                      returnKeyType="done"
                      onSubmitEditing={handleSignIn}
                      editable={!loading}
                    />
                    {errors.phone && (
                      <Text style={styles.errorText}>{errors.phone}</Text>
                    )}
                    <Text style={styles.hintText}>
                      Enter with country code (e.g., +234...)
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.signInButton,
                      (!phone || loading) && styles.signInButtonDisabled,
                    ]}
                    onPress={handleSignIn}
                    disabled={!phone || loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.background} />
                    ) : (
                      <>
                        <Text style={styles.signInButtonText}>
                          Send Verification Code
                        </Text>
                        <Feather
                          name="arrow-right"
                          size={20}
                          color={COLORS.background}
                          style={styles.buttonIcon}
                        />
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <View
                style={[styles.signUpPrompt, { paddingBottom: insets.bottom }]}
              >
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Text style={styles.signUpLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  headerSection: {
    minHeight: height * 0.4,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: 'bold',
  },
  logo: { width: 40, height: 40 },
  closeButton: {
    padding: 8,
    borderRadius: THEME.borderRadius.large,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    color: COLORS.background,
    fontSize: THEME.fontSize.xxxl,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 42,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    opacity: 0.9,
    lineHeight: 24,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    flex: 1,
    shadowColor: COLORS.background,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: COLORS.grayLight,
    borderRadius: 12,
    padding: 3,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: COLORS.white,
    fontSize: THEME.fontSize.sm,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: THEME.fontSize.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputError: {
    borderColor: COLORS.destructiveRed,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 4,
  },
  errorText: {
    color: COLORS.destructiveRed,
    fontSize: THEME.fontSize.xs,
    marginTop: 4,
    marginLeft: 4,
  },
  hintText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.xs,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
    padding: 8,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 10,
    gap: 8,
  },
  signInButtonDisabled: {
    backgroundColor: COLORS.gray,
    shadowOpacity: 0,
    elevation: 0,
  },
  signInButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  signUpPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    // paddingBottom: 20,
  },
  signUpText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    opacity: 0.8,
  },
  signUpLink: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default LoginScreen;
