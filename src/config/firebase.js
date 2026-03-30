import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';

export { auth, firestore, functions, storage };
export const db = firestore();

export const collections = {
  USERS: 'users',
  RIDES: 'rides',
  LOCATIONS: 'locations',
  NOTIFICATIONS: 'notifications',
  EARNINGS: 'earnings',
  VEHICLES: 'vehicles',
  DOCUMENTS: 'documents',
};

// Ride statuses
export const RIDE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  DRIVER: 'driver',
};
