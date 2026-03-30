import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { USER_ROLES } from '../../config/firebase';
import { registerUser } from '../../services/auth';

const { height } = Dimensions.get('window');

const RoleSelectionScreen = ({ route, navigation }) => {
  const { firstName, lastName, email, phone, password } = route.params;
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert(
        'Select Role',
        'Please select whether you are a student or driver',
      );
      return;
    }

    setLoading(true);
    console.log('🚀 Starting registration...');
    console.log('📧 Email:', email);
    console.log('👤 Name:', firstName, lastName);
    console.log('📱 Phone:', phone);
    console.log('🎭 Role:', selectedRole);

    try {
      console.log('entering the try');
      const result = await registerUser(email, password, {
        firstName,
        lastName,
        phone,
        role: selectedRole,
      });

      console.log('📝 Registration result:', {
        success: result.success,
        userId: result.user?.uid,
        hasConfirmation: !!result.confirmation,
        error: result.error,
      });

      if (result.success) {
        console.log('✅ Registration successful!');
        console.log('👤 User ID:', result.user?.uid);

        // Check if phone verification is needed
        if (result.confirmation) {
          console.log('📱 Phone verification required');
          setLoading(false);
          navigation.navigate('VerifyCode', {
            phone,
            confirmation: result.confirmation,
            mode: 'registration',
            userId: result.user?.uid,
          });
        } else {
          console.log('⏳ Waiting for AuthContext to redirect...');
          // Keep loading - AuthContext will handle navigation
        }
      } else {
        console.error('❌ Registration failed:', result.error);

        // Show validation errors if available
        if (result.errors) {
          const errorMessages = Object.values(result.errors).join('\n');
          Alert.alert('Validation Error', errorMessages);
        } else {
          Alert.alert('Registration Failed', result.error);
        }

        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      id: USER_ROLES.STUDENT,
      title: 'Student',
      description: 'Request rides to get around campus',
      icon: 'book',
      benefits: [
        'Easy ride booking',
        'Track your driver',
        'Safe campus travel',
      ],
    },
    {
      id: USER_ROLES.DRIVER,
      title: 'Driver',
      description: 'Provide rides and earn money',
      icon: 'navigation',
      benefits: ['Flexible schedule', 'Earn extra income', 'Help students'],
    },
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => !loading && navigation.goBack()}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={loading}
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
              <Text style={styles.title}>Almost done!</Text>
              <Text style={styles.subtitle}>Choose how you'll use Uniride</Text>
            </View>
          </View>

          {/* Role Selection */}
          <View style={styles.content}>
            <View style={styles.infoCard}>
              <Feather name="info" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                You can change this later in your profile settings
              </Text>
            </View>

            {roleOptions.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  selectedRole === role.id && styles.roleCardSelected,
                ]}
                onPress={() => !loading && setSelectedRole(role.id)}
                activeOpacity={0.8}
                disabled={loading}
              >
                <View style={styles.roleCardContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor:
                          selectedRole === role.id
                            ? COLORS.primary
                            : COLORS.grayLight,
                      },
                    ]}
                  >
                    <Feather
                      name={role.icon}
                      size={32}
                      color={
                        selectedRole === role.id ? COLORS.white : COLORS.gray
                      }
                    />
                  </View>

                  <View style={styles.roleInfo}>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.roleDescription}>
                      {role.description}
                    </Text>

                    {selectedRole === role.id && (
                      <View style={styles.benefitsList}>
                        {role.benefits.map((benefit, index) => (
                          <View key={index} style={styles.benefitItem}>
                            <Feather
                              name="check"
                              size={14}
                              color={COLORS.primary}
                            />
                            <Text style={styles.benefitText}>{benefit}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.checkbox,
                      selectedRole === role.id && styles.checkboxSelected,
                    ]}
                  >
                    {selectedRole === role.id && (
                      <Feather name="check" size={18} color={COLORS.white} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.continueButton,
                (!selectedRole || loading) && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!selectedRole || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={COLORS.background} />
                  <Text style={styles.loadingText}>Creating account...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Complete Setup</Text>
                  <Feather
                    name="arrow-right"
                    size={20}
                    color={COLORS.background}
                    style={styles.buttonIcon}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* Account Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Account Summary</Text>
              <View style={styles.summaryItem}>
                <Feather name="user" size={16} color={COLORS.gray} />
                <Text style={styles.summaryText}>
                  {firstName} {lastName}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Feather name="mail" size={16} color={COLORS.gray} />
                <Text style={styles.summaryText}>{email}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Feather name="phone" size={16} color={COLORS.gray} />
                <Text style={styles.summaryText}>{phone}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    minHeight: height * 0.22,
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
  subtitle: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    opacity: 0.9,
    lineHeight: 24,
    textAlign: 'center',
  },
  content: {
    backgroundColor: COLORS.white,
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: COLORS.text,
    fontSize: THEME.fontSize.sm,
    lineHeight: 18,
  },
  roleCard: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardSelected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 8,
  },
  benefitsList: {
    marginTop: 8,
    gap: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: THEME.fontSize.xs,
    color: COLORS.text,
    opacity: 0.8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
    marginTop: 24,
    marginBottom: 24,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.text,
  },
});

export default RoleSelectionScreen;
