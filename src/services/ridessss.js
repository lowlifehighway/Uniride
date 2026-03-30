import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  GeoPoint,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Create a new ride request
 */
export const createRide = async (rideData) => {
  try {
    const ride = {
      userId: rideData.userId,
      pickupLocation: new GeoPoint(rideData.pickup[1], rideData.pickup[0]),
      pickupName: rideData.pickupName,
      destinationLocation: new GeoPoint(
        rideData.destination[1],
        rideData.destination[0],
      ),
      destinationName: rideData.destinationName,
      status: 'pending',
      rideType: rideData.rideType,
      paymentMethod: rideData.paymentMethod,
      fare: rideData.fare,
      distance: rideData.distance,
      duration: rideData.duration,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'rides'), ride);

    return { success: true, rideId: docRef.id };
  } catch (error) {
    console.error('Create ride error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update ride status
 */
export const updateRideStatus = async (rideId, status, additionalData = {}) => {
  try {
    const rideRef = doc(db, 'rides', rideId);

    const updateData = {
      status,
      ...additionalData,
    };

    if (status === 'ongoing') {
      updateData.startedAt = serverTimestamp();
    } else if (status === 'completed') {
      updateData.completedAt = serverTimestamp();
    }

    await updateDoc(rideRef, updateData);

    return { success: true };
  } catch (error) {
    console.error('Update ride status error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's rides
 */
export const getUserRides = async (userId) => {
  try {
    const q = query(
      collection(db, 'rides'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    const rides = [];

    querySnapshot.forEach((doc) => {
      rides.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, rides };
  } catch (error) {
    console.error('Get user rides error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get ride by ID
 */
export const getRideById = async (rideId) => {
  try {
    const rideDoc = await getDoc(doc(db, 'rides', rideId));

    if (rideDoc.exists()) {
      return {
        success: true,
        ride: { id: rideDoc.id, ...rideDoc.data() },
      };
    } else {
      return { success: false, error: 'Ride not found' };
    }
  } catch (error) {
    console.error('Get ride error:', error);
    return { success: false, error: error.message };
  }
};
