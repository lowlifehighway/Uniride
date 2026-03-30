globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import {
  setupBackgroundHandler,
  createNotificationChannel,
  setupForegroundHandler,
  setupNotificationOpenedHandler,
} from './src/services/notificationHandler';
import {
  getFCMToken,
  setupTokenRefreshListener,
} from './src/services/notifications';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';

setupBackgroundHandler();

export default function App() {
  const navigationRef = React.useRef();

  useEffect(() => {
    // Initialize notifications
    const initNotifications = async () => {
      // Create channels (Android)
      await createNotificationChannel();

      // Set up handlers
      const unsubscribeForeground = setupForegroundHandler();

      // Pass navigation ref for notification opened handler
      // This allows navigation when user taps notification
      setupNotificationOpenedHandler(navigationRef.current);

      return unsubscribeForeground;
    };

    const unsubscribePromise = initNotifications();

    // Cleanup function
    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ToastProvider>
  );
}
