import { useState, useRef, useContext } from 'react';
import {
  Alert,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  Switch,
  Modal,
  Platform,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { deleteAccount, logoutUser } from '../../services/auth';
import { AuthContext } from '../../contexts/AuthContext';
import { stopLocationTracking } from '../../services/driverLocation';

const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [emailReceipt, setEmailReceipt] = useState(true);
  const [theme, setTheme] = useState('system'); // 'system', 'light', 'dark'
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { userData } = useContext(AuthContext);

  const themeOptions = [
    { label: 'System', value: 'system', icon: 'smartphone' },
    { label: 'Light', value: 'light', icon: 'sun' },
    { label: 'Dark', value: 'dark', icon: 'moon' },
  ];

  const getSelectedThemeLabel = () => {
    const selected = themeOptions.find((option) => option.value === theme);
    return selected?.label || 'System';
  };

  const getSelectedThemeIcon = () => {
    const selected = themeOptions.find((option) => option.value === theme);
    return selected?.icon || 'smartphone';
  };

  const handleThemeSelect = (selectedTheme) => {
    setTheme(selectedTheme);
    setThemeModalVisible(false);
    // Here you would implement your actual theme change logic
    // For example:
    // if (selectedTheme === 'system') useSystemTheme();
    // else if (selectedTheme === 'light') setLightTheme();
    // else setDarkTheme();
  };

  const openThemeModal = () => {
    setThemeModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeThemeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setThemeModalVisible(false);
    });
  };

  const handleLogout = async () => {
    console.log('Logout initiated');
    setLoading(true);

    try {
      console.log('Calling logoutUser service');
      const logoutResult = await logoutUser();
      console.log('Logout result:', logoutResult);

      if (!logoutResult.success) {
        // Handle specific error cases
        let errorMessage = 'An error occurred during logout. Please try again.';

        if (logoutResult.error?.includes('network')) {
          errorMessage = 'Network error. Please check your connection.';
        }

        Alert.alert('Logout Failed', errorMessage);
        setLoading(false);
        return; // Exit early on failure
      }

      // If successful, navigation will be handled automatically by AuthContext
      // You might want to add additional cleanup here
      await stopLocationTracking();
      console.log('Logout successful');
    } catch (error) {
      console.error('Unexpected logout error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    console.log('account deletion initiated');
    setLoading(true);
    console.log('getting here');
    Alert.alert(
      'Are you sure you want to delete your account?',
      'This process cannot be reversed',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              console.log('calling account deletion services');
              const result = await deleteAccount();
              console.log('delete account result', result);

              if (!result.success) {
                let errorMessage =
                  'An error occurred during logout. Please try again.';

                if (result.error?.includes('network')) {
                  errorMessage = 'Network error. Please check your connection.';
                }

                Alert.alert('Account deletion Failed', errorMessage);
                setLoading(false);
                return;
              }

              await stopLocationTracking();
              console.log('Account deletion Successful');
            } catch (error) {
              console.error('Unexpected deleting account error:', error);
              Alert.alert(
                'Error',
                'An unexpected error occurred. Please try again.',
              );
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const modalOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={`${userData.firstName} ${userData.lastName}`}
                placeholderTextColor={COLORS.gray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={userData.email}
                placeholderTextColor={COLORS.gray}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={userData.phone}
                placeholderTextColor={COLORS.gray}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Settings Toggles */}
          <View style={styles.settingsSection}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Feather name="bell" size={20} color={COLORS.white} />
                </View>
                <Text style={styles.settingText}>Notification</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: COLORS.darkGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Feather name="mail" size={20} color={COLORS.white} />
                </View>
                <Text style={styles.settingText}>Email Receipt</Text>
              </View>
              <Switch
                value={emailReceipt}
                onValueChange={setEmailReceipt}
                trackColor={{ false: COLORS.darkGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            {/* Theme Dropdown */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={openThemeModal}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Feather
                    name={getSelectedThemeIcon()}
                    size={20}
                    color={COLORS.white}
                  />
                </View>
                <Text style={styles.settingText}>Theme</Text>
              </View>
              <View style={styles.themeSelector}>
                <Text style={styles.themeSelectorText}>
                  {getSelectedThemeLabel()}
                </Text>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={COLORS.darkGray}
                />
              </View>
            </TouchableOpacity>
            {/* {Log out and Delete buttons} */}
            <View style={styles.settingItem}>
              <TouchableOpacity
                style={styles.settingLeft}
                onPress={handleLogout}
              >
                <View style={styles.settingIconContainer}>
                  <Feather name="log-out" size={20} color={COLORS.white} />
                </View>
                <Text style={styles.settingText}>Log Out</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.settingItem}>
              <TouchableOpacity
                style={styles.settingLeft}
                onPress={handleDeleteAccount}
              >
                <View
                  style={[
                    styles.settingIconContainer,
                    styles.deleteIconContainer,
                  ]}
                >
                  <Feather name="trash-2" size={20} color={COLORS.white} />
                </View>
                <Text style={styles.settingText}>Delete account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Theme Selection Modal */}
        <Modal
          visible={themeModalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={closeThemeModal}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeThemeModal}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  opacity: modalOpacity,
                  transform: [{ translateY: modalTranslateY }],
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Theme</Text>
                <TouchableOpacity onPress={closeThemeModal}>
                  <Feather name="x" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.themeOptionsContainer}>
                {themeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.themeOption,
                      theme === option.value && styles.themeOptionSelected,
                    ]}
                    onPress={() => handleThemeSelect(option.value)}
                  >
                    <View style={styles.themeOptionLeft}>
                      <View
                        style={[
                          styles.themeOptionIconContainer,
                          theme === option.value &&
                            styles.themeOptionIconContainerSelected,
                        ]}
                      >
                        <Feather
                          name={option.icon}
                          size={20}
                          color={
                            theme === option.value ? COLORS.white : COLORS.text
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.themeOptionText,
                          theme === option.value &&
                            styles.themeOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {theme === option.value && (
                      <Feather name="check" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
  },
  profileSection: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.gray + '30',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: THEME.fontSize.md,
    color: COLORS.background,
  },
  settingsSection: {
    display: '',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deleteIconContainer: {
    backgroundColor: COLORS.destructiveRed,
  },
  settingText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
  },
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
  },
  themeSelectorText: {
    fontSize: 14,
    color: COLORS.text,
    marginRight: 8,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  themeOptionsContainer: {
    paddingVertical: 8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  themeOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeOptionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  themeOptionIconContainerSelected: {
    backgroundColor: COLORS.primary,
  },
  themeOptionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  themeOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default SettingsScreen;
