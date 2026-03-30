import messaging from '@react-native-firebase/messaging';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import firestore from '@react-native-firebase/firestore';

/**
 * Request notification permissions
 */
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        // Android 13+
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('❌ Notification permission denied');
          return false;
        }
      }
    } else {
      // iOS
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('❌ Notification permission denied');
        return false;
      }
    }

    console.log('✅ Notification permission granted');
    return true;
  } catch (error) {
    console.error('❌ Error requesting permission:', error);
    return false;
  }
};

/**
 * Get FCM token and save to Firestore
 */
export const getFCMToken = async (userId) => {
  try {
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      return null;
    }

    // Register device for remote notifications (iOS)
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    // Get FCM token
    const token = await messaging().getToken();
    console.log('✅ FCM Token:', token);

    // Save token to Firestore
    if (userId) {
      await firestore().collection('users').doc(userId).update({
        fcmToken: token,
        fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log('✅ FCM token saved to Firestore');
    }

    return token;
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
};

/**
 * Handle token refresh
 */
export const setupTokenRefreshListener = (userId) => {
  return messaging().onTokenRefresh(async (token) => {
    console.log('🔄 FCM token refreshed:', token);

    if (userId) {
      await firestore().collection('users').doc(userId).update({
        fcmToken: token,
        fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
      });
    }
  });
};

export const removeFCMToken = async (userId) => {
  try {
    if (userId) {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({ fcmToken: null });
    }

    await messaging().deleteToken();
    console.log('✅ FCM token removed');
  } catch (error) {
    console.error('❌ Error removing FCM token:', error);
  }
};
