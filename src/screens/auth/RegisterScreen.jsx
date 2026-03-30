import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import logoBlack from '../../../assets/icon-black.png';

const { height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [errors, setErrors] = useState({});
  const [isFocused, setIsFocused] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
  });
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleFieldChange = (field, value) => {
    switch (field) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'password':
        setPassword(value);
        break;
    }

    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleContinue = () => {
    const newErrors = {};

    if (!firstName || firstName.trim().length === 0) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!lastName || lastName.trim().length === 0) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!email || email.trim().length === 0) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone || phone.trim().length === 0) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      newErrors.phone =
        'Please enter a valid phone number (e.g., +2349012345678)';
    }

    if (!password || password.length === 0) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!agreed) {
      Alert.alert(
        'Terms & Privacy',
        'Please agree to the Terms of Service and Privacy Policy to continue',
      );
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      Alert.alert('Validation Error', newErrors[firstErrorField]);
      return;
    }

    navigation.navigate('RoleSelection', {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
    });
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'fair';
    if (password.length < 12) return 'good';
    return 'strong';
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    switch (strength) {
      case 'weak':
        return '#FF4444';
      case 'fair':
        return '#FFA500';
      case 'good':
        return COLORS.primary;
      case 'strong':
        return '#4CAF50';
      default:
        return COLORS.gray;
    }
  };

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : keyboardOpen
              ? 'height'
              : undefined
        }
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
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
              >
                <Feather name="x" size={32} color={COLORS.background} />
              </TouchableOpacity>
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.title}>Complete your free account setup</Text>
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
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>
                  Let's get your account started
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>First name</Text>
                <TextInput
                  style={[
                    styles.input,
                    isFocused.firstName && styles.inputFocused,
                    errors.firstName && styles.inputError,
                  ]}
                  placeholder="First name"
                  placeholderTextColor={COLORS.gray}
                  value={firstName}
                  onChangeText={(value) =>
                    handleFieldChange('firstName', value)
                  }
                  onFocus={() => handleFocus('firstName')}
                  onBlur={() => handleBlur('firstName')}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last name</Text>
                <TextInput
                  style={[
                    styles.input,
                    isFocused.lastName && styles.inputFocused,
                    errors.lastName && styles.inputError,
                  ]}
                  placeholder="Last name"
                  placeholderTextColor={COLORS.gray}
                  value={lastName}
                  onChangeText={(value) => handleFieldChange('lastName', value)}
                  onFocus={() => handleFocus('lastName')}
                  onBlur={() => handleBlur('lastName')}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>

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
                  onChangeText={(value) => handleFieldChange('email', value)}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

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
                  onChangeText={(value) => handleFieldChange('phone', value)}
                  onFocus={() => handleFocus('phone')}
                  onBlur={() => handleBlur('phone')}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
                {!errors.phone && (
                  <Text style={styles.hintText}>
                    Include country code (e.g., +234...)
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Create a password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      isFocused.password && styles.inputFocused,
                      errors.password && styles.inputError,
                    ]}
                    placeholder="Create password"
                    placeholderTextColor={COLORS.gray}
                    secureTextEntry={hidePassword}
                    value={password}
                    onChangeText={(value) =>
                      handleFieldChange('password', value)
                    }
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                  />
                  <TouchableOpacity
                    style={styles.eyePlaceholder}
                    onPress={() => setHidePassword(!hidePassword)}
                  >
                    <Feather
                      name={hidePassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={isFocused.password ? COLORS.primary : COLORS.gray}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
                {!errors.password && password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.passwordStrengthBar}>
                      <View
                        style={[
                          styles.passwordStrengthFill,
                          {
                            width: `${Math.min((password.length / 12) * 100, 100)}%`,
                            backgroundColor: getPasswordStrengthColor(),
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.passwordStrengthText,
                        { color: getPasswordStrengthColor() },
                      ]}
                    >
                      {getPasswordStrength()}
                    </Text>
                  </View>
                )}
                {!errors.password && password.length === 0 && (
                  <Text style={styles.hintText}>
                    Minimum 6 characters (8+ recommended)
                  </Text>
                )}
              </View>

              {/* Agreement */}
              <View style={styles.agreementContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, agreed && styles.checkboxChecked]}
                  onPress={() => setAgreed(!agreed)}
                  activeOpacity={0.7}
                >
                  {agreed && (
                    <Feather name="check" size={16} color={COLORS.background} />
                  )}
                </TouchableOpacity>
                <Text style={styles.agreementText}>
                  I agree to the{' '}
                  <Text style={styles.link}>Terms of Service</Text> and{' '}
                  <Text style={styles.link}>Privacy Policy</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  (!firstName ||
                    !lastName ||
                    !email ||
                    !phone ||
                    !password ||
                    !agreed) &&
                    styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={
                  !firstName ||
                  !lastName ||
                  !email ||
                  !phone ||
                  !password ||
                  !agreed
                }
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Feather
                  name="arrow-right"
                  size={20}
                  color={COLORS.background}
                  style={styles.buttonIcon}
                />
              </TouchableOpacity>

              <View
                style={[styles.signInPrompt, { paddingBottom: insets.bottom }]}
              >
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signInLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {},
  scrollContent: {
    flexGrow: 1,
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
  form: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    shadowColor: COLORS.background,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  stepIndicator: {
    marginBottom: 32,
  },
  stepText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: '600',
    letterSpacing: 0.3,
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
    borderColor: '#FF4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyePlaceholder: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 4,
  },
  errorText: {
    color: '#FF4444',
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
  passwordStrengthContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.grayLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
    minWidth: 50,
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    marginBottom: 40,
    padding: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  agreementText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.sm,
    lineHeight: 20,
    flex: 1,
  },
  link: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  continueButton: {
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
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.gray,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  signInPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    paddingBottom: 20,
  },
  signInText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    opacity: 0.8,
  },
  signInLink: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default RegisterScreen;
