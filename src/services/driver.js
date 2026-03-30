import firestore from '@react-native-firebase/firestore';
import { collections } from '../config/firebase';

/**
 * Driver Service - React Native Firebase
 * Handles all driver-related Firebase operations
 */

// ==================== DRIVER PROFILE ====================

/**
 * Get driver profile data
 */
export const getDriverProfile = async (driverId) => {
  try {
    const driverSnap = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .get();

    if (!driverSnap.exists) {
      return { success: false, error: 'Driver not found' };
    }

    const driverData = driverSnap.data();

    // Verify driver role
    if (driverData.role !== 'driver') {
      return { success: false, error: 'User is not a driver' };
    }

    return {
      success: true,
      data: {
        id: driverSnap.id,
        ...driverData,
      },
    };
  } catch (error) {
    console.error('Error getting driver profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update driver profile
 */
export const updateDriverProfile = async (driverId, updates) => {
  try {
    await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error) {
    console.error('Error updating driver profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update driver online status
 */
export const updateDriverStatus = async (driverId, isOnline) => {
  try {
    await firestore().collection(collections.USERS).doc(driverId).update({
      isOnline,
      lastOnlineAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Driver ${isOnline ? 'online' : 'offline'}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating driver status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update driver location
 */
export const updateDriverLocation = async (driverId, location) => {
  try {
    await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .update({
        currentLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error) {
    console.error('Error updating driver location:', error);
    return { success: false, error: error.message };
  }
};

// ==================== VEHICLE MANAGEMENT ====================

/**
 * Update vehicle information
 */
export const updateVehicleInfo = async (driverId, vehicleInfo) => {
  try {
    await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .update({
        vehicleInfo: {
          make: vehicleInfo.make,
          model: vehicleInfo.model,
          year: vehicleInfo.year,
          plate: vehicleInfo.plate,
          color: vehicleInfo.color,
          seats: vehicleInfo.seats,
          photos: vehicleInfo.photos || [],
        },
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error) {
    console.error('Error updating vehicle info:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add vehicle photo
 */
export const addVehiclePhoto = async (driverId, photoUrl) => {
  try {
    const driverSnap = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .get();

    if (!driverSnap.exists) {
      return { success: false, error: 'Driver not found' };
    }

    const currentPhotos = driverSnap.data().vehicleInfo?.photos || [];

    await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .update({
        'vehicleInfo.photos': [...currentPhotos, photoUrl],
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error) {
    console.error('Error adding vehicle photo:', error);
    return { success: false, error: error.message };
  }
};

// ==================== DOCUMENTS ====================

/**
 * Add driver document
 */
export const addDriverDocument = async (driverId, document) => {
  try {
    const documentRef = firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .collection('documents')
      .doc();

    await documentRef.set({
      name: document.name,
      type: document.type,
      url: document.url,
      status: 'pending',
      expiryDate: document.expiryDate,
      uploadedAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, documentId: documentRef.id };
  } catch (error) {
    console.error('Error adding document:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get driver documents
 */
export const getDriverDocuments = async (driverId) => {
  try {
    const documentsSnap = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .collection('documents')
      .get();

    const documents = documentsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: documents };
  } catch (error) {
    console.error('Error getting documents:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update document status
 */
export const updateDocumentStatus = async (driverId, documentId, status) => {
  try {
    await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .collection('documents')
      .doc(documentId)
      .update({
        status,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error) {
    console.error('Error updating document status:', error);
    return { success: false, error: error.message };
  }
};

// ==================== MAINTENANCE RECORDS ====================

/**
 * Add maintenance record
 */
export const addMaintenanceRecord = async (driverId, record) => {
  try {
    const recordRef = firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .collection('maintenance')
      .doc();

    await recordRef.set({
      type: record.type,
      date: record.date,
      mileage: record.mileage,
      cost: record.cost,
      description: record.description || '',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, recordId: recordRef.id };
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get maintenance records
 */
export const getMaintenanceRecords = async (driverId) => {
  try {
    const recordsSnap = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .collection('maintenance')
      .orderBy('date', 'desc')
      .get();

    const records = recordsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: records };
  } catch (error) {
    console.error('Error getting maintenance records:', error);
    return { success: false, error: error.message };
  }
};

// ==================== SCHEDULE & AVAILABILITY ====================

/**
 * Update driver schedule
 */
export const updateDriverSchedule = async (driverId, schedule) => {
  try {
    await firestore().collection(collections.USERS).doc(driverId).update({
      schedule,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating schedule:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update driver availability
 */
export const updateDriverAvailability = async (driverId, availability) => {
  try {
    await firestore().collection(collections.USERS).doc(driverId).update({
      availability,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating availability:', error);
    return { success: false, error: error.message };
  }
};

// ==================== BANK ACCOUNTS ====================

/**
 * Add bank account
 */
export const addBankAccount = async (driverId, bankAccount) => {
  try {
    const driverSnap = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .get();

    if (!driverSnap.exists) {
      return { success: false, error: 'Driver not found' };
    }

    const currentAccounts = driverSnap.data().bankAccounts || [];

    const newAccount = {
      id: Date.now().toString(),
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      accountName: bankAccount.accountName,
      addedAt: firestore.FieldValue.serverTimestamp(),
    };

    await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .update({
        bankAccounts: [...currentAccounts, newAccount],
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    return { success: true, accountId: newAccount.id };
  } catch (error) {
    console.error('Error adding bank account:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove bank account
 */
export const removeBankAccount = async (driverId, accountId) => {
  try {
    const driverSnap = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .get();

    if (!driverSnap.exists) {
      return { success: false, error: 'Driver not found' };
    }

    const currentAccounts = driverSnap.data().bankAccounts || [];
    const updatedAccounts = currentAccounts.filter(
      (acc) => acc.id !== accountId,
    );

    await firestore().collection(collections.USERS).doc(driverId).update({
      bankAccounts: updatedAccounts,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing bank account:', error);
    return { success: false, error: error.message };
  }
};

// ==================== STATISTICS ====================

/**
 * Get driver statistics
 */
export const getDriverStats = async (driverId, period = 'today') => {
  try {
    let startDate;
    const now = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    // Query completed rides for the period
    const ridesSnap = await firestore()
      .collection(collections.RIDES)
      .where('driverId', '==', driverId)
      .where('status', '==', 'completed')
      .where('completedAt', '>=', firestore.Timestamp.fromDate(startDate))
      .get();

    let totalEarnings = 0;
    let totalRides = ridesSnap.size;
    let totalHours = 0;

    ridesSnap.forEach((doc) => {
      const ride = doc.data();
      // Calculate driver earnings (85% of fare after 15% platform fee)
      totalEarnings += Math.round(ride.fare * 0.85);

      // Calculate hours (if duration is stored in seconds)
      if (ride.duration) {
        totalHours += ride.duration / 3600;
      }
    });

    // Calculate rating
    const driverDoc = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .get();
    const rating = driverDoc.data()?.rating || 0;

    return {
      success: true,
      data: {
        earnings: totalEarnings,
        rides: totalRides,
        hours: Math.round(totalHours * 10) / 10,
        rating,
      },
    };
  } catch (error) {
    console.error('Error getting driver stats:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get daily earnings breakdown
 */
export const getDailyEarnings = async (driverId, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const ridesSnap = await firestore()
      .collection(collections.RIDES)
      .where('driverId', '==', driverId)
      .where('status', '==', 'completed')
      .where('completedAt', '>=', firestore.Timestamp.fromDate(startDate))
      .get();

    // Group by day
    const dailyData = {};

    ridesSnap.forEach((doc) => {
      const ride = doc.data();
      const date = ride.completedAt.toDate();
      const dayKey = date.toISOString().split('T')[0];

      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          date: dayKey,
          earnings: 0,
          rides: 0,
        };
      }

      dailyData[dayKey].earnings += Math.round(ride.fare * 0.85);
      dailyData[dayKey].rides += 1;
    });

    // Convert to array and sort by date
    const dailyArray = Object.values(dailyData).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    return { success: true, data: dailyArray };
  } catch (error) {
    console.error('Error getting daily earnings:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update driver rating
 */
export const updateDriverRating = async (driverId, newRating, totalRatings) => {
  try {
    await firestore().collection(collections.USERS).doc(driverId).update({
      rating: newRating,
      totalRatings: totalRatings,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating driver rating:', error);
    return { success: false, error: error.message };
  }
};

// ==================== REAL-TIME LISTENERS ====================

/**
 * Listen to driver profile changes
 */
export const subscribeToDriverProfile = (driverId, callback) => {
  return firestore()
    .collection(collections.USERS)
    .doc(driverId)
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
          callback({ success: false, error: 'Driver not found' });
        }
      },
      (error) => {
        console.error('Error in driver profile listener:', error);
        callback({ success: false, error: error.message });
      },
    );
};

export default {
  // Profile
  getDriverProfile,
  updateDriverProfile,
  updateDriverStatus,
  updateDriverLocation,

  // Vehicle
  updateVehicleInfo,
  addVehiclePhoto,

  // Documents
  addDriverDocument,
  getDriverDocuments,
  updateDocumentStatus,

  // Maintenance
  addMaintenanceRecord,
  getMaintenanceRecords,

  // Schedule
  updateDriverSchedule,
  updateDriverAvailability,

  // Banking
  addBankAccount,
  removeBankAccount,

  // Stats
  getDriverStats,
  getDailyEarnings,
  updateDriverRating,

  // Listeners
  subscribeToDriverProfile,
};
