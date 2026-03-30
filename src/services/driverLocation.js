// services/driverLocation.js
// Driver side: continuously publishes GPS to Firestore
// Student side: subscribes to real-time driver location

import * as Location from 'expo-location';
import firestore from '@react-native-firebase/firestore';

let locationSubscription = null;

// ============================================
// DRIVER SIDE: Publish location continuously
// ============================================

export const startLocationTracking = async (driverId, rideId) => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Location permission denied' };
    }

    // Try background permissions (for when app is minimized)
    await Location.requestBackgroundPermissionsAsync().catch(() => {
      console.warn('⚠️ Background location unavailable');
    });

    // Stop any existing subscription first
    await stopLocationTracking();

    console.log('📍 Starting location tracking:', driverId);

    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000, // every 3 seconds
        distanceInterval: 10, // or every 10 meters
      },
      async ({ coords }) => {
        const { latitude, longitude, heading, speed } = coords;

        const locationPayload = {
          latitude,
          longitude,
          heading: heading || 0,
          speed: speed || 0,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };

        try {
          const batch = firestore().batch();

          // Update driver's user doc
          batch.update(firestore().collection('users').doc(driverId), {
            location: locationPayload,
            isOnline: true,
          });

          // Update ride doc with driver location (students subscribe here)
          if (rideId) {
            batch.update(firestore().collection('rides').doc(rideId), {
              driverLocation: locationPayload,
            });
          }

          await batch.commit();
          console.log(`📍 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } catch (err) {
          console.error('❌ Location update failed:', err);
        }
      },
    );

    return { success: true };
  } catch (error) {
    console.error('❌ startLocationTracking error:', error);
    return { success: false, error: error.message };
  }
};

export const stopLocationTracking = async () => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
    console.log('🛑 Location tracking stopped');
  }
};

// ============================================
// STUDENT SIDE: Subscribe to driver location
// ============================================

export const subscribeToDriverLocation = (rideId, callback) => {
  if (!rideId) {
    console.error('❌ rideId required');
    return () => {};
  }

  console.log('👂 Subscribing to driver location, rideId:', rideId);

  const unsubscribe = firestore()
    .collection('rides')
    .doc(rideId)
    .onSnapshot(
      (doc) => {
        if (!doc.exists) return;

        const loc = doc.data()?.driverLocation;
        if (loc?.latitude && loc?.longitude) {
          callback({
            success: true,
            location: {
              latitude: loc.latitude,
              longitude: loc.longitude,
              heading: loc.heading || 0,
              // Array format for CampusMap markers: [lng, lat]
              coordinates: [loc.longitude, loc.latitude],
            },
          });
        }
      },
      (error) => {
        console.error('❌ subscribeToDriverLocation error:', error);
        callback({ success: false, error: error.message });
      },
    );

  return unsubscribe;
};
