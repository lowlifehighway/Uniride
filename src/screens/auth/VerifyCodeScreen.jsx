import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  confirmPhoneLogin,
  verifyPhoneCode,
  resendPhoneVerification,
} from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import {
  getFCMToken,
  setupTokenRefreshListener,
} from '../../services/pushNotifications';

const VerifyCodeScreen = ({ navigation, route }) => {
  const { phone, confirmation, mode = 'login', userId } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const { user, userRole } = useAuth();

  useEffect(() => {
    // Start countdown timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
  }, []);

  const handleCodeChange = (text, index) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newCode.every((digit) => digit !== '') && index === 5) {
      handleContinue(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = async (verificationCode = null) => {
    const codeString = verificationCode || code.join('');

    if (codeString.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      let result;

      if (mode === 'login') {
        // Phone login flow - AuthContext will handle navigation
        result = await confirmPhoneLogin(confirmation, codeString);
        if (result.success) {
          console.log('✅ Phone login successful', result.user);
          if (result.user?.uid) {
            try {
              await getFCMToken(result.user.uid); // ← Use result.user.uid
              setupTokenRefreshListener(result.user.uid); // ← Use result.user.uid
              console.log('✅ FCM token setup complete');
            } catch (fcmError) {
              console.error('⚠️ FCM token setup failed:', fcmError);
            }
          }
          navigation.reset('Auth'); // Trigger AuthContext to check auth state and navigate accordingly
          // AuthContext will handle navigation automatically
        }
      } else {
        // REGISTRATION FLOW - Phone verification
        result = await verifyPhoneCode(confirmation, codeString);
        console.log('just inputed verifyphonecode code');
        if (result.success) {
          console.log('✅ Phone verification successful for registration');

          // Redirect to login screen after successful registration verification
          Alert.alert(
            'Verification Successful',
            'Your phone number has been verified. Please log in to continue.',
            [
              {
                text: 'Go to Login',
                onPress: () => {
                  // Navigate to Auth navigator and then to SignIn
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Auth',
                        params: {
                          screen: 'Login',
                          params: {
                            message:
                              'Phone verified successfully! Please log in.',
                            phone: phone, // Pre-fill phone number
                          },
                        },
                      },
                    ],
                  });
                },
              },
            ],
          );
        } else {
          console.error('❌ Phone verification failed:', result.error);
          Alert.alert('Verification Failed', result.error);
          // Clear the code
          setCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;

    setResending(true);

    try {
      const result = await resendPhoneVerification(phone);

      if (result.success) {
        Alert.alert(
          'Code Sent',
          'A new verification code has been sent to your phone',
        );
        // Reset timer
        setTimer(60);
        setCanResend(false);
        // Update confirmation object
        if (result.confirmation) {
          route.params.confirmation = result.confirmation;
        }
      } else {
        Alert.alert('Resend Failed', result.error);
      }
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handlePaste = async () => {
    // Note: Clipboard API requires additional setup in React Native
    // This is a placeholder for paste functionality
    Alert.alert(
      'Paste Code',
      'Paste functionality requires clipboard permissions',
    );
  };

  const formatPhone = (phoneNumber) => {
    // Format phone number for display (e.g., +234 901 234 5678)
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length <= 3) return `+${cleaned}`;
    if (cleaned.length <= 6)
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 9)
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => !loading && navigation.goBack()}
            disabled={loading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="chevron-left" size={28} color={COLORS.background} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Feather name="smartphone" size={48} color={COLORS.background} />
          </View>

          <Text style={styles.title}>Verify Your Phone</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phone}>{formatPhone(phone)}</Text>
          </Text>

          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[styles.codeInput, digit && styles.codeInputFilled]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Timer / Resend */}
          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                style={styles.resendButton}
              >
                {resending ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <>
                    {/* <Feather
                      name="refresh-cw"
                      size={16}
                      color={COLORS.primary}
                    /> */}
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.timerContainer}>
                <Feather name="clock" size={16} color={COLORS.gray} />
                <Text style={styles.timerText}>
                  Resend available in {timer}s
                </Text>
              </View>
            )}
          </View>

          {/* Paste Button (Optional) */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.pasteButton}
              onPress={handlePaste}
              disabled={loading}
            >
              <Feather name="clipboard" size={18} color={COLORS.primary} />
              <Text style={styles.pasteText}>Paste Code</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.continueButton,
              (code.some((d) => !d) || loading) &&
                styles.continueButtonDisabled,
            ]}
            onPress={() => handleContinue()}
            disabled={code.some((d) => !d) || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Verify Code</Text>
                <Feather
                  name="arrow-right"
                  size={20}
                  color={COLORS.background}
                />
              </>
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() =>
              Alert.alert(
                'Having Trouble?',
                'Make sure you entered the correct phone number and check your messages. The code may take a few moments to arrive.',
                [{ text: 'OK' }],
              )
            }
          >
            <Feather name="help-circle" size={18} color={COLORS.background} />
            <Text style={styles.helpText}>Need help?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    color: COLORS.background,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    lineHeight: 24,
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.9,
  },
  phone: {
    fontWeight: 'bold',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  codeInput: {
    flex: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.background,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  codeInputFilled: {
    backgroundColor: COLORS.background,
    color: COLORS.primary,
    borderColor: COLORS.background,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 40,
    justifyContent: 'center',
  },
  resendButton: {
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendLink: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.sm,
    opacity: 0.8,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  pasteText: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: COLORS.background,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: COLORS.background,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 24,
  },
  helpText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.sm,
    opacity: 0.9,
  },
});

export default VerifyCodeScreen;
