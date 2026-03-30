import firestore from '@react-native-firebase/firestore';
import { collections } from '../config/firebase';
import { createNotification } from './notifications';

/**
 * Rides Service - React Native Firebase
 * Handles all ride-related Firebase operations for drivers
 */

// ==================== AVAILABLE RIDES ====================

/**
 * Get available ride requests for driver
 * @param {string} driverId - Driver ID
 * @param {object} driverLocation - Driver's current location { latitude, longitude }
 * @param {number} maxDistance - Maximum distance in km (default: 10)
 */
export const getAvailableRides = async (
  driverId,
  driverLocation = null,
  maxDistance = 10,
) => {
  try {
    // Query for pending rides (not yet accepted)
    const ridesSnap = await firestore()
      .collection(collections.RIDES)
      .where('status', '==', 'pending')
      .where('driverId', '==', null)
      .orderBy('requestedAt', 'desc')
      .limit(20)
      .get();

    const rides = ridesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // TODO: Filter by distance if driverLocation is provided
    // This would require GeoFirestore or similar for proper geo queries

    return { success: true, data: rides };
  } catch (error) {
    console.error('Error getting available rides:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to available rides in real-time
 */
export const subscribeToAvailableRides = (driverId, callback) => {
  return firestore()
    .collection(collections.RIDES)
    .where('status', '==', 'pending')
    .where('driverId', '==', null)
    .orderBy('requestedAt', 'desc')
    .limit(20)
    .onSnapshot(
      (snapshot) => {
        const rides = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        callback({ success: true, data: rides });
      },
      (error) => {
        console.error('Error in available rides listener:', error);
        callback({ success: false, error: error.message });
      },
    );
};

// ==================== ACCEPT RIDE ====================

/**
 * Accept a ride request
 */
export const acceptRide = async (rideId, driverId) => {
  try {
    const rideSnap = await firestore()
      .collection(collections.RIDES)
      .doc(rideId)
      .get();

    if (!rideSnap.exists) {
      return { success: false, error: 'Ride not found' };
    }

    const ride = rideSnap.data();

    // Check if ride is still available
    if (ride.status !== 'pending' || ride.driverId !== null) {
      return { success: false, error: 'Ride no longer available' };
    }

    // Update ride with driver info
    await firestore().collection(collections.RIDES).doc(rideId).update({
      driverId,
      status: 'accepted',
      acceptedAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Increment driver's total accepted rides
    await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .update({
        totalAcceptedRides: firestore.FieldValue.increment(1),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    console.log('✅ Ride accepted:', rideId);
    return {
      success: true,
      data: { id: rideId, ...ride, driverId, status: 'accepted' },
    };
  } catch (error) {
    console.error('Error accepting ride:', error);
    return { success: false, error: error.message };
  }
};

// ==================== ACTIVE RIDE ====================

/**
 * Start ride (driver picked up student)
 */
export const startRide = async (rideId) => {
  try {
    await firestore().collection(collections.RIDES).doc(rideId).update({
      status: 'inProgress',
      startedAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Ride started:', rideId);
    return { success: true };
  } catch (error) {
    console.error('Error starting ride:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete ride
 */
export const completeRide = async (rideId, driverId) => {
  try {
    const rideSnap = await firestore()
      .collection(collections.RIDES)
      .doc(rideId)
      .get();

    if (!rideSnap.exists) {
      return { success: false, error: 'Ride not found' };
    }

    const ride = rideSnap.data();

    // Update ride status
    await firestore().collection(collections.RIDES).doc(rideId).update({
      status: 'completed',
      completedAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      finalizedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Calculate earnings (85% of fare after 15% platform fee)
    const driverEarnings = Math.round(ride.fare * 0.85);
    const platformFee = Math.round(ride.fare * 0.15);

    // Create transaction record
    const transactionRef = firestore().collection('transactions').doc();

    await transactionRef.set({
      driverId,
      studentId: ride.studentId,
      rideId,
      type: 'ride',
      amount: driverEarnings,
      fare: ride.fare,
      platformFee,
      status: 'completed',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update driver stats
    await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .update({
        totalRides: firestore.FieldValue.increment(1),
        totalEarnings: firestore.FieldValue.increment(driverEarnings),
        availableBalance: firestore.FieldValue.increment(driverEarnings),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    // ✅ Create notification for student
    await createNotification(ride.studentId, {
      type: 'ride_completed',
      title: 'Ride Completed',
      message: `Your ride has been completed. Fare: ₦${ride.fare}`,
      data: { rideId },
    });

    // ✅ Create notification for driver
    await createNotification(driverId, {
      type: 'payment_received',
      title: 'Payment Received',
      message: `You earned ₦${driverEarnings} from your last ride!`,
      data: { rideId, amount: driverEarnings },
    });

    console.log('✅ Ride completed:', rideId);
    console.log('💰 Driver earned:', driverEarnings);

    return {
      success: true,
      data: {
        earnings: driverEarnings,
        platformFee,
        totalFare: ride.fare,
      },
    };
  } catch (error) {
    console.error('Error completing ride:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel ride
 */
export const cancelRide = async (rideId, reason, cancelledBy = 'driver') => {
  try {
    await firestore().collection(collections.RIDES).doc(rideId).update({
      status: 'cancelled',
      cancelledAt: firestore.FieldValue.serverTimestamp(),
      cancelledBy,
      cancellationReason: reason,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      finalizedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('❌ Ride cancelled:', rideId);
    return { success: true };
  } catch (error) {
    console.error('Error cancelling ride:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get active ride for driver
 */
export const getActiveRide = async (driverId) => {
  try {
    const ridesSnap = await firestore()
      .collection(collections.RIDES)
      .where('driverId', '==', driverId)
      .where('status', 'in', ['accepted', 'inProgress'])
      .limit(1)
      .get();

    if (ridesSnap.empty) {
      return { success: true, data: null };
    }

    const ride = {
      id: ridesSnap.docs[0].id,
      ...ridesSnap.docs[0].data(),
    };

    return { success: true, data: ride };
  } catch (error) {
    console.error('Error getting active ride:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to active ride changes
 */
export const subscribeToActiveRide = (rideId, callback) => {
  return firestore()
    .collection(collections.RIDES)
    .doc(rideId)
    .onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback({
            success: true,
            data: {
              id: doc.id,
              ...doc.data(),
            },
          });
        } else {
          callback({ success: false, error: 'Ride not found' });
        }
      },
      (error) => {
        console.error('Error in active ride listener:', error);
        callback({ success: false, error: error.message });
      },
    );
};

// ==================== RIDE HISTORY ====================

/**
 * Get driver's ride history
 */
export const getDriverRideHistory = async (
  driverId,
  filterStatus = 'all',
  limitCount = 50,
) => {
  try {
    let query = firestore()
      .collection(collections.RIDES)
      .where('driverId', '==', driverId);

    if (filterStatus === 'all') {
      query = query.where('status', 'in', ['completed', 'cancelled']);
    } else {
      query = query.where('status', '==', filterStatus);
    }

    const ridesSnap = await query
      .orderBy('completedAt', 'desc')
      .limit(limitCount)
      .get();
    //note switch completed at to finalized at
    const rides = ridesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: rides };
  } catch (error) {
    console.error('Error getting ride history:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get ride details
 */
export const getRideDetails = async (rideId, userRole) => {
  try {
    const rideSnap = await firestore()
      .collection(collections.RIDES)
      .doc(rideId)
      .get();

    if (!rideSnap.exists) {
      return { success: false, error: 'Ride not found' };
    }

    const ride = {
      id: rideSnap.id,
      ...rideSnap.data(),
    };

    // Get student info
    if (userRole === 'driver') {
      if (ride.studentId) {
        const studentSnap = await firestore()
          .collection(collections.USERS)
          .doc(ride.studentId)
          .get();

        if (studentSnap.exists) {
          ride.studentInfo = {
            firstName: studentSnap.data().firstName,
            lastName: studentSnap.data().lastName,
            phone: studentSnap.data().phone,
            rating: studentSnap.data().rating || 0,
            profilePic: studentSnap.data().profilePicture || null,
          };
        }
      }
    } else if (userRole === 'student') {
      if (ride.driverId) {
        const driverSnap = await firestore()
          .collection(collections.USERS)
          .doc(ride.driverId)
          .get();

        if (driverSnap.exists) {
          ride.driverInfo = {
            firstName: driverSnap.data().firstName,
            lastName: driverSnap.data().lastName,
            phone: driverSnap.data().phone,
            rating: driverSnap.data().rating || 0,
            profilePic: driverSnap.data().profilePicture || null,
          };
        }
      }
    }

    return { success: true, data: ride };
  } catch (error) {
    console.error('Error getting ride details:', error);
    return { success: false, error: error.message };
  }
};

// ==================== RIDE RATING ====================

/**
 * Rate student after ride
 */
export const rateStudent = async (rideId, studentId, rating, comment = '') => {
  try {
    await firestore()
      .collection(collections.RIDES)
      .doc(rideId)
      .update({
        driverRating: {
          rating,
          comment,
          ratedAt: firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    // Update student's overall rating
    const studentSnap = await firestore()
      .collection(collections.USERS)
      .doc(studentId)
      .get();

    if (studentSnap.exists) {
      const currentRating = studentSnap.data().rating || 0;
      const totalRatings = studentSnap.data().totalRatings || 0;

      const newTotalRatings = totalRatings + 1;
      const newRating =
        (currentRating * totalRatings + rating) / newTotalRatings;

      await firestore()
        .collection(collections.USERS)
        .doc(studentId)
        .update({
          rating: Math.round(newRating * 10) / 10,
          totalRatings: newTotalRatings,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    }

    return { success: true };
  } catch (error) {
    console.error('Error rating student:', error);
    return { success: false, error: error.message };
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate distance between two points (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

/**
 * Format distance for display
 */
export const formatRideDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration for display
 */
export const formatRideDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min${minutes !== 1 ? 's' : ''}`;
};

export default {
  // Available Rides
  getAvailableRides,
  subscribeToAvailableRides,

  // Ride Actions
  acceptRide,
  startRide,
  completeRide,
  cancelRide,

  // Active Ride
  getActiveRide,
  subscribeToActiveRide,

  // History
  getDriverRideHistory,
  getRideDetails,

  // Rating
  rateStudent,

  // Helpers
  calculateDistance,
  formatRideDistance,
  formatRideDuration,
};
