import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const SignUpLocationScreen = ({ navigation }) => {
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isFocused, setIsFocused] = useState({
    country: false,
    phoneNumber: false,
    studentId: false,
  });
  const phoneNumberRef = useRef();
  const studentIdRef = useRef();

  const handleContinue = () => {
    if (country && phoneNumber && studentId && agreed) {
      navigation.navigate('VerifyCode');
    }
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={COLORS.primary}
          />

          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.headerSection}>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather
                    name="chevron-left"
                    size={28}
                    color={COLORS.background}
                  />
                </TouchableOpacity>
              </View>

              {/* Title */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Complete your free</Text>
                <Text style={styles.title}>account setup</Text>
              </View>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.stepIndicator}>
                <Feather
                  name="map-pin"
                  size={24}
                  color={COLORS.background}
                  style={styles.stepIcon}
                />
                <Text style={styles.stepText}>
                  Let's know more about your location.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select country</Text>
                <TextInput
                  style={[
                    styles.input,
                    isFocused.country && styles.inputFocused,
                  ]}
                  placeholder="Select country"
                  placeholderTextColor={COLORS.gray}
                  value={country}
                  onChangeText={setCountry}
                  onFocus={() => handleFocus('country')}
                  onBlur={() => handleBlur('country')}
                  returnKeyType="next" // 👈 Set to "next"
                  blurOnSubmit={false} // 👈 Important! Prevents keyboard dismissal
                  onSubmitEditing={() => phoneNumberRef.current.focus()} // 👈 Focus next input
                />
                <Feather
                  name="chevron-down"
                  size={20}
                  color={isFocused.country ? COLORS.primary : COLORS.gray}
                  style={styles.inputIcon}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone number</Text>
                <TextInput
                  ref={phoneNumberRef} // 👈 Set the ref
                  style={[
                    styles.input,
                    isFocused.phoneNumber && styles.inputFocused,
                  ]}
                  placeholder="Phone number"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  onFocus={() => handleFocus('phoneNumber')}
                  onBlur={() => handleBlur('phoneNumber')}
                  returnKeyType="next" // 👈 Set to "next"
                  blurOnSubmit={false} // 👈 Important!
                  onSubmitEditing={() => studentIdRef.current.focus()} // 👈 Focus next input
                />
                <Feather
                  name="phone"
                  size={20}
                  color={isFocused.phoneNumber ? COLORS.primary : COLORS.gray}
                  style={styles.inputIcon}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ID</Text>
                <TextInput
                  ref={studentIdRef} // 👈 Set the ref
                  style={[
                    styles.input,
                    isFocused.studentId && styles.inputFocused,
                  ]}
                  placeholder="Student ID"
                  placeholderTextColor={COLORS.gray}
                  value={studentId}
                  onChangeText={setStudentId}
                  onFocus={() => handleFocus('studentId')}
                  onBlur={() => handleBlur('studentId')}
                  returnKeyType="done" // 👈 Last field uses "done"
                  blurOnSubmit={true} // 👈 Last field can dismiss keyboard
                  onSubmitEditing={handleContinue} // 👈 Submit form on last field
                />
                <Feather
                  name="credit-card"
                  size={20}
                  color={isFocused.studentId ? COLORS.primary : COLORS.gray}
                  style={styles.inputIcon}
                />
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
                  I verify that the information provided is accurate and I
                  consent to verification checks.
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  (!country || !phoneNumber || !studentId || !agreed) &&
                    styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={!country || !phoneNumber || !studentId || !agreed}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    minHeight: height * 0.2,
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
  closeButton: {
    padding: 8,
    borderRadius: THEME.borderRadius.large,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  logo: {
    color: COLORS.background,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    color: COLORS.background,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 42,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    marginRight: 12,
  },
  stepText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: COLORS.text,
    fontSize: THEME.fontSize.sm,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
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
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
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
    color: COLORS.text,
    fontSize: THEME.fontSize.sm,
    lineHeight: 20,
    flex: 1,
  },
  link: {
    color: COLORS.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  continueButton: {
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
    flexDirection: 'row',
    justifyContent: 'center',
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
    marginLeft: 8,
  },
});

export default SignUpLocationScreen;
