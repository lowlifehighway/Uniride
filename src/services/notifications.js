// services/notifications.js
import firestore from '@react-native-firebase/firestore';
import { collections } from '../config/firebase';

/**
 * Notifications Service
 * Handles all notification operations
 */

// ==================== GET NOTIFICATIONS ====================

/**
 * Get notifications for a user
 */
export const getNotifications = async (userId, limitCount = 50) => {
  try {
    const notificationsSnap = await firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    const notifications = notificationsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to real-time notifications
 */
export const subscribeToNotifications = (userId, callback) => {
  return firestore()
    .collection('notifications')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .onSnapshot(
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback({ success: true, data: notifications });
      },
      (error) => {
        console.error('Error in notifications listener:', error);
        callback({ success: false, error: error.message });
      },
    );
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId) => {
  try {
    const notificationsSnap = await firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    return { success: true, data: notificationsSnap.size };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to unread count
 */
export const subscribeToUnreadCount = (userId, callback) => {
  return firestore()
    .collection('notifications')
    .where('userId', '==', userId)
    .where('read', '==', false)
    .onSnapshot(
      (snapshot) => {
        callback({ success: true, data: snapshot.size });
      },
      (error) => {
        console.error('Error in unread count listener:', error);
        callback({ success: false, error: error.message });
      },
    );
};

// ==================== MARK AS READ ====================

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    await firestore().collection('notifications').doc(notificationId).update({
      read: true,
      readAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId) => {
  try {
    const notificationsSnap = await firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    const batch = firestore().batch();

    notificationsSnap.docs.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    console.log('✅ Marked all notifications as read');
    return { success: true };
  } catch (error) {
    console.error('Error marking all as read:', error);
    return { success: false, error: error.message };
  }
};

// ==================== DELETE ====================

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    await firestore().collection('notifications').doc(notificationId).delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (userId) => {
  try {
    const notificationsSnap = await firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .get();

    const batch = firestore().batch();

    notificationsSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log('✅ Deleted all notifications');
    return { success: true };
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return { success: false, error: error.message };
  }
};

// ==================== CREATE (System Use) ====================

/**
 * Create a notification
 * Types: 'ride_accepted', 'ride_started', 'ride_completed', 'payment_received', 'withdrawal_processed', etc.
 */
export const createNotification = async (userId, notification) => {
  try {
    const notificationRef = firestore().collection('notifications').doc();

    await notificationRef.set({
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Notification created:', notificationRef.id);
    return { success: true, data: { id: notificationRef.id } };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

export default {
  getNotifications,
  subscribeToNotifications,
  getUnreadCount,
  subscribeToUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
};
