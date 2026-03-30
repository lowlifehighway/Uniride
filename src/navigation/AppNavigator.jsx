import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import DriverNavigator from './DriverNavigator';
import { StyleSheet } from 'react-native';
import LogoScreen from '../screens/LogoScreen';
import LaunchNavigator from './LaunchNavigator';
import { useNotifications } from '../hooks/useNotifications';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, userRole, loading } = useAuth();
  const [initLoading, setInitLoading] = useState(true);
  useNotifications();

  if (loading) {
    return <LogoScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {initLoading ? (
        <Stack.Screen name="Launch">
          {(props) => (
            <LaunchNavigator {...props} setInitLoading={setInitLoading} />
          )}
        </Stack.Screen>
      ) : !user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : userRole === 'student' ? (
        <Stack.Screen name="Student" component={StudentNavigator} />
      ) : userRole === 'driver' ? (
        <Stack.Screen name="Driver" component={DriverNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
