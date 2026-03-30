import firestore from '@react-native-firebase/firestore';
import { db, collections, RIDE_STATUS } from '../config/firebase';

/**
 * Student Ride Request Service
 * Connects students with available drivers
 */

// ✅ CREATE RIDE REQUEST
export const createRideRequest = async (studentId, rideData) => {
  try {
    const {
      // Location data
      pickup,
      destination,

      // Ride settings
      rideType,
      paymentMethod,
      status,

      // Route data
      distance,
      duration,
      fare,

      // Passenger data
      isForSelf,
      passengerName,
      passengerPhone,
      passengerRelationship,
    } = rideData;

    // ✅ FIXED: Remove undefined values before saving to Firestore
    const cleanRideData = {
      // Student info (who's booking/paying)
      studentId,

      // Driver (null until accepted)
      driverId: null,

      // Status
      status: status || 'pending',

      // ✅ Locations - handle undefined coordinates
      pickup: {
        latitude: pickup?.coordinates[1] || 0,
        longitude: pickup?.coordinates[0] || 0,
        name: pickup.name || 'Pickup Location',
      },
      destination: {
        latitude: destination?.coordinates[1] || 0,
        longitude: destination?.coordinates[0] || 0,
        name: destination.name || 'Destination',
      },

      // Route data - default to 0 if undefined
      distance: distance || 0,
      duration: duration || 0,

      // Ride details
      rideType: rideType || 'express',
      fare: fare || (rideType === 'express' ? 300 : 600),
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',

      // ✅ Passenger info - handle undefined values
      isForSelf: isForSelf !== undefined ? isForSelf : true,
      passengerName: passengerName || 'Student',
      passengerPhone: passengerPhone || '',
      passengerRelationship: passengerRelationship || 'Self',

      // Timestamps
      requestedAt: firestore.FieldValue.serverTimestamp(),
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    console.log('📝 Creating ride with data:', {
      studentId,
      pickup: cleanRideData.pickup,
      destination: cleanRideData.destination,
      passenger: cleanRideData.passengerName,
      isForSelf: cleanRideData.isForSelf,
    });

    // Create ride document
    const rideRef = await firestore().collection('rides').add(cleanRideData);

    console.log('✅ Ride created:', rideRef.id);

    return {
      success: true,
      data: {
        rideId: rideRef.id,
      },
    };
  } catch (error) {
    console.error('❌ Error creating ride request:', error);
    return {
      success: false,
      error: error.message || 'Failed to create ride request',
    };
  }
};

// ✅ LISTEN FOR DRIVER MATCH
export const subscribeToRideMatch = (rideId, callback) => {
  const rideRef = db.collection(collections.RIDES).doc(rideId);

  return rideRef.onSnapshot(
    (doc) => {
      if (doc.exists) {
        const ride = doc.data();

        // Check if driver accepted
        if (ride.driverId && ride.status === RIDE_STATUS.ACCEPTED) {
          // Get driver details
          getDriverDetails(ride.driverId).then((driverResult) => {
            if (driverResult.success) {
              callback({
                success: true,
                matched: true,
                ride: {
                  id: doc.id,
                  ...ride,
                },
                driver: driverResult.data,
              });
            }
          });
        } else {
          // Still searching
          callback({
            success: true,
            matched: false,
            ride: {
              id: doc.id,
              ...ride,
            },
          });
        }
      }
    },
    (error) => {
      console.error('Error in ride match listener:', error);
      callback({ success: false, error: error.message });
    },
  );
};

// ✅ GET DRIVER DETAILS
export const getDriverDetails = async (driverId) => {
  try {
    const driverRef = db.collection(collections.USERS).doc(driverId);
    const driverSnap = await driverRef.get();

    if (driverSnap.exists) {
      const driver = driverSnap.data();
      return {
        success: true,
        data: {
          id: driverId,
          name:
            `${driver.firstName || ''} ${driver.lastName || ''}`.trim() ||
            'Unknown Driver',
          phone: driver.phone || '',
          rating: driver.rating || 0,
          vehicle: driver.vehicleInfo
            ? `${driver.vehicleInfo.make || 'TVS'} ${driver.vehicleInfo.plate || 'UNKNOWN'}`
            : 'Vehicle not specified',
          vehicleInfo: driver.vehicleInfo || null,
          profilePic: driver.profilePicture || null,
        },
      };
    }

    return { success: false, error: 'Driver not found' };
  } catch (error) {
    console.error('Error getting driver details:', error);
    return { success: false, error: error.message };
  }
};

// ✅ CANCEL RIDE REQUEST (by student)
export const cancelRideRequest = async (rideId, reason) => {
  try {
    const rideRef = db.collection(collections.RIDES).doc(rideId);

    await rideRef.update({
      status: RIDE_STATUS.CANCELLED,
      cancelledBy: 'student',
      cancellationReason: reason,
      cancelledAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Ride cancelled by student');

    return { success: true };
  } catch (error) {
    console.error('❌ Error cancelling ride:', error);
    return { success: false, error: error.message };
  }
};

// ✅ SUBSCRIBE TO RIDE STATUS UPDATES
export const subscribeToRideStatus = (rideId, callback) => {
  const rideRef = db.collection(collections.RIDES).doc(rideId);

  return rideRef.onSnapshot(
    async (doc) => {
      if (doc.exists) {
        const ride = doc.data();

        // Get driver details if driver assigned
        let driver = null;
        if (ride.driverId) {
          const driverResult = await getDriverDetails(ride.driverId);
          if (driverResult.success) {
            driver = driverResult.data;
          }
        }

        callback({
          success: true,
          data: {
            id: doc.id,
            ...ride,
            driver,
          },
        });
      } else {
        callback({ success: false, error: 'Ride not found' });
      }
    },
    (error) => {
      console.error('Error in ride status listener:', error);
      callback({ success: false, error: error.message });
    },
  );
};

// ✅ RATE DRIVER (after ride)
export const rateDriver = async (rideId, rating, comment = '') => {
  try {
    console.log('⭐ Rating driver:', { rideId, rating, comment });

    // ✅ Validate inputs
    if (!rideId) {
      console.error('❌ Ride ID is missing');
      return { success: false, error: 'Ride ID is required' };
    }

    if (!rating || rating < 1 || rating > 5) {
      console.error('❌ Invalid rating:', rating);
      return { success: false, error: 'Rating must be between 1 and 5' };
    }
    const rideRef = db.collection(collections.RIDES).doc(rideId);
    const rideSnap = await rideRef.get();

    if (!rideSnap.exists) {
      console.error('❌ Ride not found for rating');
      return { success: false, error: 'Ride not found' };
    }

    const rideData = rideSnap.data();

    if (rideData.status !== 'completed') {
      console.error('❌ Ride not completed yet, status:', rideData.status);
      return { success: false, error: 'Ride is not completed yet' };
    }
    const driverId = rideData.driverId;

    if (!driverId) {
      console.error('❌ No driver assigned to this ride');
      return { success: false, error: 'No driver assigned to this ride' };
    }

    console.log('✅ Ride data valid:', {
      rideId,
      driverId,
      status: rideData.status,
    });

    await rideRef.update({
      studentRating: {
        rating,
        comment,
        ratedAt: firestore.FieldValue.serverTimestamp(),
      },
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update driver's overall rating
    const driverRef = db.collection(collections.USERS).doc(driverId);
    const driverSnap = await driverRef.get();

    if (driverSnap.exists) {
      const driverData = driverSnap.data();
      const currentRating = driverData.rating || 0;
      const totalRatings = driverData.totalRatings || 0;

      const newTotalRatings = totalRatings + 1;
      const newRating =
        (currentRating * totalRatings + rating) / newTotalRatings;

      await driverRef.update({
        rating: Math.round(newRating * 10) / 10,
        totalRatings: newTotalRatings,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log('✅ Driver rated successfully');

    return { success: true };
  } catch (error) {
    console.error('❌ Error rating driver:', error);
    return { success: false, error: error.message };
  }
};

// ✅ GET STUDENT RIDE HISTORY
export const getStudentRideHistory = async (studentId, limitCount = 50) => {
  try {
    const ridesRef = db.collection(collections.RIDES);
    const q = ridesRef
      .where('studentId', '==', studentId)
      .where('status', 'in', [RIDE_STATUS.COMPLETED, RIDE_STATUS.CANCELLED])
      .orderBy('completedAt', 'desc')
      .limit(limitCount);

    const ridesSnap = await q.get();

    const rides = [];

    for (const rideDoc of ridesSnap.docs) {
      const ride = rideDoc.data();

      // Get driver info
      let driver = null;
      if (ride.driverId) {
        const driverResult = await getDriverDetails(ride.driverId);
        if (driverResult.success) {
          driver = driverResult.data;
        }
      }

      rides.push({
        id: rideDoc.id,
        ...ride,
        driver,
      });
    }

    return { success: true, data: rides };
  } catch (error) {
    console.error('❌ Error getting ride history:', error);
    return { success: false, error: error.message };
  }
};

// ✅ GET ACTIVE RIDE FOR STUDENT
export const getActiveStudentRide = async (studentId) => {
  try {
    const ridesRef = db.collection(collections.RIDES);
    const q = ridesRef
      .where('studentId', '==', studentId)
      .where('status', 'in', [
        RIDE_STATUS.PENDING,
        RIDE_STATUS.ACCEPTED,
        RIDE_STATUS.IN_PROGRESS,
      ])
      .limit(1);

    const ridesSnap = await q.get();

    if (!ridesSnap.empty) {
      const rideDoc = ridesSnap.docs[0];
      const ride = rideDoc.data();

      // Get driver details if driver assigned
      let driver = null;
      if (ride.driverId) {
        const driverResult = await getDriverDetails(ride.driverId);
        if (driverResult.success) {
          driver = driverResult.data;
        }
      }

      return {
        success: true,
        data: {
          id: rideDoc.id,
          ...ride,
          driver,
        },
      };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error('❌ Error getting active ride:', error);
    return { success: false, error: error.message };
  }
};

// ✅ HELPER: Format ride for display
export const formatRideData = (ride) => {
  // Convert Firestore timestamp to Date if needed
  let date = new Date();
  if (ride.completedAt) {
    date = ride.completedAt.toDate
      ? ride.completedAt.toDate()
      : new Date(ride.completedAt);
  } else if (ride.requestedAt) {
    date = ride.requestedAt.toDate
      ? ride.requestedAt.toDate()
      : new Date(ride.requestedAt);
  }

  return {
    id: ride.id,
    pickupName: ride.pickup?.name || 'Pickup location',
    destinationName: ride.destination?.name || 'Destination',
    fare: ride.fare || 0,
    status: ride.status || 'unknown',
    rideType: ride.rideType || 'express',
    paymentMethod: ride.paymentMethod || 'cash',
    date,
    driver: ride.driver || null,
  };
};

export default {
  createRideRequest,
  subscribeToRideMatch,
  cancelRideRequest,
  subscribeToRideStatus,
  rateDriver,
  getStudentRideHistory,
  getActiveStudentRide,
  formatRideData,
};
