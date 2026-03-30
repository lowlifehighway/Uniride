// services/activeRide.js
import firestore from '@react-native-firebase/firestore';

/**
 * Get driver's active ride
 * @param {string} driverId - Driver's user ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getDriverActiveRide = async (driverId) => {
  try {
    console.log('🔍 Checking for active ride for driver:', driverId);

    const ridesRef = firestore().collection('rides');
    const snapshot = await ridesRef
      .where('driverId', '==', driverId)
      .where('status', 'in', ['accepted', 'inProgress'])
      .orderBy('acceptedAt', 'desc')
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const rideDoc = snapshot.docs[0];
      const ride = { id: rideDoc.id, ...rideDoc.data() };

      console.log('✅ Found active ride:', ride.id, 'Status:', ride.status);

      // Get student details
      const studentDoc = await firestore()
        .collection('users')
        .doc(ride.studentId)
        .get();
      const student = studentDoc.exists ? studentDoc.data() : null;

      return {
        success: true,
        data: {
          ...ride,
          studentName: student
            ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
            : 'Student',
          studentPhone: student?.phone,
          studentRating: student?.rating || 0,
        },
      };
    }

    console.log('📭 No active ride found');
    return { success: true, data: null };
  } catch (error) {
    console.error('❌ Error getting driver active ride:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get student's active ride
 * @param {string} studentId - Student's user ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getStudentActiveRide = async (studentId) => {
  try {
    console.log('🔍 Checking for active ride for student:', studentId);

    const ridesRef = firestore().collection('rides');
    const snapshot = await ridesRef
      .where('studentId', '==', studentId)
      .where('status', 'in', ['pending', 'accepted', 'inProgress'])
      .orderBy('requestedAt', 'desc')
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const rideDoc = snapshot.docs[0];
      const ride = { id: rideDoc.id, ...rideDoc.data() };

      console.log('✅ Found active ride:', ride.id, 'Status:', ride.status);

      // Get driver details if ride is accepted
      let driver = null;
      if (ride.driverId) {
        const driverDoc = await firestore()
          .collection('users')
          .doc(ride.driverId)
          .get();
        if (driverDoc.exists) {
          const driverData = driverDoc.data();
          driver = {
            name: `${driverData.firstName || ''} ${driverData.lastName || ''}`.trim(),
            phone: driverData.phone,
            rating: driverData.rating || 0,
            vehicle: driverData.vehicleInfo
              ? `${driverData.vehicleInfo.make || 'TVS'} ${driverData.vehicleInfo.plate || 'ABC-123'}`
              : 'TVS ABC-123',
            vehicleInfo: driverData.vehicleInfo,
          };
        }
      }

      return {
        success: true,
        data: {
          ...ride,
          driver,
        },
      };
    }

    console.log('📭 No active ride found');
    return { success: true, data: null };
  } catch (error) {
    console.error('❌ Error getting student active ride:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to driver's active ride changes
 * @param {string} driverId - Driver's user ID
 * @param {function} callback - Callback function with ride data
 * @returns {function} Unsubscribe function
 */
export const subscribeToDriverActiveRide = (driverId, callback) => {
  console.log('📡 Subscribing to driver active ride:', driverId);

  const ridesRef = firestore().collection('rides');
  const query = ridesRef
    .where('driverId', '==', driverId)
    .where('status', 'in', ['accepted', 'inProgress']);

  const unsubscribe = query.onSnapshot(
    async (snapshot) => {
      if (!snapshot.empty) {
        const rideDoc = snapshot.docs[0];
        const ride = { id: rideDoc.id, ...rideDoc.data() };

        // Get student details
        const studentDoc = await firestore()
          .collection('users')
          .doc(ride.studentId)
          .get();
        const student = studentDoc.exists ? studentDoc.data() : null;

        callback({
          success: true,
          data: {
            ...ride,
            studentName: student
              ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
              : 'Student',
            studentPhone: student?.phone,
            studentRating: student?.rating || 0,
          },
        });
      } else {
        callback({ success: true, data: null });
      }
    },
    (error) => {
      console.error('❌ Error in active ride subscription:', error);
      callback({ success: false, error: error.message });
    },
  );

  return unsubscribe;
};

/**
 * Subscribe to student's active ride changes
 * @param {string} studentId - Student's user ID
 * @param {function} callback - Callback function with ride data
 * @returns {function} Unsubscribe function
 */
export const subscribeToStudentActiveRide = (studentId, callback) => {
  console.log('📡 Subscribing to student active ride:', studentId);

  const ridesRef = firestore().collection('rides');
  const query = ridesRef
    .where('studentId', '==', studentId)
    .where('status', 'in', ['pending', 'accepted', 'inProgress']);

  const unsubscribe = query.onSnapshot(
    async (snapshot) => {
      if (!snapshot.empty) {
        const rideDoc = snapshot.docs[0];
        const ride = { id: rideDoc.id, ...rideDoc.data() };

        // Get driver details if available
        let driver = null;
        if (ride.driverId) {
          const driverDoc = await firestore()
            .collection('users')
            .doc(ride.driverId)
            .get();
          if (driverDoc.exists) {
            const driverData = driverDoc.data();
            driver = {
              name: `${driverData.firstName || ''} ${driverData.lastName || ''}`.trim(),
              phone: driverData.phone,
              rating: driverData.rating || 0,
              vehicle: driverData.vehicleInfo
                ? `${driverData.vehicleInfo.make || 'TVS'} ${driverData.vehicleInfo.plate || 'ABC-123'}`
                : 'TVS ABC-123',
              vehicleInfo: driverData.vehicleInfo,
            };
          }
        }

        callback({
          success: true,
          data: {
            ...ride,
            driver,
          },
        });
      } else {
        callback({ success: true, data: null });
      }
    },
    (error) => {
      console.error('❌ Error in active ride subscription:', error);
      callback({ success: false, error: error.message });
    },
  );

  return unsubscribe;
};

/**
 * Check if user has any active ride
 * @param {string} userId - User ID
 * @param {string} role - User role ('student' or 'driver')
 * @returns {Promise<{success: boolean, hasActiveRide: boolean, data?: object}>}
 */
export const hasActiveRide = async (userId, role) => {
  try {
    if (role === 'driver') {
      const result = await getDriverActiveRide(userId);
      return {
        success: true,
        hasActiveRide: !!result.data,
        data: result.data,
      };
    } else {
      const result = await getStudentActiveRide(userId);
      return {
        success: true,
        hasActiveRide: !!result.data,
        data: result.data,
      };
    }
  } catch (error) {
    console.error('❌ Error checking active ride:', error);
    return { success: false, hasActiveRide: false, error: error.message };
  }
};
