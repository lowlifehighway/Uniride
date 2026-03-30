import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

/**
 * Create notification channel (Android)
 */
export const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'uniride_channel',
      name: 'Uniride Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });

    // Create separate channels for different notification types
    await notifee.createChannel({
      id: 'ride_requests',
      name: 'Ride Requests',
      importance: AndroidImportance.HIGH,
      sound: 'ride_request',
      vibration: true,
    });

    await notifee.createChannel({
      id: 'ride_updates',
      name: 'Ride Updates',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }
};

/**
 * Display local notification using Notifee
 */
export const displayNotification = async (notification) => {
  const { title, body, data } = notification;

  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId:
        data?.type === 'ride_request' ? 'ride_requests' : 'ride_updates',
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
      sound: 'default',
      vibrationPattern: [300, 500],
    },
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {
        alert: true,
        badge: true,
        sound: true,
      },
    },
  });
};

/**
 * Handle foreground notifications
 */
export const setupForegroundHandler = () => {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('📬 Foreground notification:', remoteMessage);

    // Display notification even when app is in foreground
    await displayNotification({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
    });
  });
};

/**
 * Handle background/quit state notifications
 */
export const setupBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📬 Background notification:', remoteMessage);

    // Process notification data
    // Can update local database, etc.
  });
};

/**
 * Handle notification tap/press
 */
export const setupNotificationOpenedHandler = (navigation) => {
  // App opened from quit state
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('📱 App opened from quit state:', remoteMessage);
        handleNotificationNavigation(remoteMessage, navigation);
      }
    });

  // App opened from background
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('📱 App opened from background:', remoteMessage);
    handleNotificationNavigation(remoteMessage, navigation);
  });
};

/**
 * Navigate based on notification type
 */
const handleNotificationNavigation = (remoteMessage, navigation) => {
  const { data } = remoteMessage;

  switch (data?.type) {
    case 'ride_request':
      navigation.navigate('AvailableRides', { rideId: data.rideId });
      break;

    case 'driver_accepted':
      navigation.navigate('DriverMatch', { rideId: data.rideId });
      break;

    case 'ride_started':
      navigation.navigate('RideTracking', { rideId: data.rideId });
      break;

    case 'ride_completed':
      navigation.navigate('RideHistory', { rideId: data.rideId });
      break;

    case 'payment_received':
      navigation.navigate('Earnings');
      break;

    default:
      console.log('Unknown notification type:', data?.type);
  }
};
