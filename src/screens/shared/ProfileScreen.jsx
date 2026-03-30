// screens/shared/ProfileScreen.js - WITH PROFILE PICTURE UPLOAD

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { changeProfilePicture } from '../../services/profilePicture';

const ProfileScreen = ({ navigation }) => {
  const { userRole, userData, user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);

  const menuItems =
    userRole === 'student'
      ? [
          { icon: 'settings', label: 'Settings', route: 'Settings' },
          { icon: 'shield', label: 'Safety Center', route: 'SafetyCenter' },
          { icon: 'help-circle', label: 'FAQ', route: 'SafetyCenter' },
          { icon: 'users', label: 'Saved drivers', route: 'SavedDrivers' },
          { icon: 'file-text', label: 'Legal', route: 'Legal' },
        ]
      : [
          { icon: 'settings', label: 'Settings', route: 'Settings' },
          { icon: 'shield', label: 'Safety Center', route: 'SafetyCenter' },
          { icon: 'help-circle', label: 'FAQ', route: 'SafetyCenter' },
          { icon: 'truck', label: 'Vehicle', route: 'VehicleInfo' },
          { icon: 'file-text', label: 'Legal', route: 'Legal' },
        ];

  // ✅ Handle profile picture change
  const handleChangeProfilePicture = async () => {
    setUploadingImage(true);

    const result = await changeProfilePicture(
      user.uid,
      userData?.profilePicture,
    );

    setUploadingImage(false);

    if (result.success) {
      // Image will auto-update via AuthContext listener
      console.log('✅ Profile picture updated');
    } else if (result.error !== 'Cancelled') {
      Alert.alert('Upload Failed', 'Could not update profile picture');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userData?.firstName}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>
                  {userData?.rating?.toFixed(1) || '5.0'}
                </Text>
              </View>
            </View>

            {/* ✅ Profile Picture with Upload */}
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleChangeProfilePicture}
              disabled={uploadingImage}
            >
              <View style={styles.avatar}>
                {uploadingImage ? (
                  <ActivityIndicator size="large" color={COLORS.primary} />
                ) : userData?.profilePicture ? (
                  <Image
                    source={{ uri: userData.profilePicture }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Feather name="user" size={40} color={COLORS.gray} />
                )}
              </View>

              {/* ✅ Camera icon overlay */}
              {!uploadingImage && (
                <View style={styles.cameraIconContainer}>
                  <Feather name="camera" size={16} color={COLORS.white} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Feather
                  name="help-circle"
                  size={28}
                  color={COLORS.background}
                />
              </View>
              <Text style={styles.quickActionLabel}>Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Wallet')}
            >
              <View style={styles.quickActionIcon}>
                <Feather
                  name="credit-card"
                  size={28}
                  color={COLORS.background}
                />
              </View>
              <Text style={styles.quickActionLabel}>Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => {
                navigation.navigate(
                  userRole === 'student' ? 'Activity' : 'RideHistory',
                );
              }}
            >
              <View style={styles.quickActionIcon}>
                <Feather name="bell" size={28} color={COLORS.background} />
              </View>
              <Text style={styles.quickActionLabel}>Activities</Text>
            </TouchableOpacity>
          </View>

          {/* Promo Cards */}
          <View style={styles.promoCards}>
            {userRole === 'student' && (
              <TouchableOpacity
                style={styles.promoCard}
                onPress={() => {
                  navigation.navigate('Promotion');
                }}
              >
                <View style={styles.promoContent}>
                  <Text style={styles.promoTitle}>Enjoy 40% off rides</Text>
                  <Text style={styles.promoSubtitle}>
                    Go rediscover your city for less
                  </Text>
                </View>
                <View style={styles.promoImage}>
                  <Image
                    source={require('../../../assets/ticket.png')}
                    style={{
                      width: 110,
                      height: 110,
                      position: 'absolute',
                      right: -20,
                      top: -30,
                      // justifyContent: 'center',
                      // alignItems: 'center',
                    }}
                  />
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.promoCard, styles.promoCardDark]}
              onPress={() => navigation.navigate('SafetyCenter')}
            >
              <View style={styles.promoContent}>
                <Text style={styles.promoTitleLight}>Safety checkup</Text>
                <Text style={styles.promoSubtitleLight}>
                  Learn ways to make rides safer
                </Text>
              </View>
              <View style={styles.promoImage}>
                <Image source={require('../../../assets/safety-checkup.png')} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.route)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Feather name={item.icon} size={22} color={COLORS.white} />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 38,
  },
  ratingContainer: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  rating: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
  },
  avatarContainer: {
    marginLeft: 20,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // ✅ NEW: Avatar image
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  // ✅ NEW: Camera icon overlay
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    color: COLORS.white,
    fontSize: THEME.fontSize.sm,
    fontWeight: '600',
  },
  promoCards: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  promoCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoCardDark: {
    backgroundColor: COLORS.darkGray,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoSubtitle: {
    color: COLORS.background,
    fontSize: THEME.fontSize.sm,
    opacity: 0.8,
  },
  promoTitleLight: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoSubtitleLight: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
  },
  promoImage: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkGray,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    marginRight: 16,
  },
  menuItemText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: '500',
  },
});

export default ProfileScreen;
