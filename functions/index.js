const {
  onDocumentUpdated,
  onDocumentCreated,
} = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const messaging = getMessaging();

/**
 * Send notification when driver accepts ride
 */
exports.onRideAccepted = onDocumentUpdated('rides/{rideId}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  // Check if status changed to 'accepted'
  if (before.status !== 'accepted' && after.status === 'accepted') {
    try {
      const studentId = after.studentId;

      // Get student's FCM token
      const studentDoc = await db.collection('users').doc(studentId).get();
      const fcmToken = studentDoc.data()?.fcmToken;

      if (!fcmToken) {
        console.log('❌ No FCM token for student:', studentId);
        return;
      }

      // Get driver info
      const driverDoc = await db.collection('users').doc(after.driverId).get();
      const driver = driverDoc.data();
      const driverName =
        `${driver?.firstName || ''} ${driver?.lastName || ''}`.trim();

      // Send notification
      const message = {
        notification: {
          title: 'Driver Found! 🚗',
          body: `${driverName} is on the way to pick you up`,
        },
        data: {
          type: 'driver_accepted',
          rideId: event.params.rideId,
          driverId: after.driverId,
          driverName: driverName,
        },
        token: fcmToken,
      };

      await messaging.send(message);
      console.log('✅ Notification sent to student:', studentId);
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }
});

/**
 * Send notification to online drivers on new ride request
 */
exports.onNewRideRequest = onDocumentCreated(
  'rides/{rideId}',
  async (event) => {
    const ride = event.data.data();

    if (ride.status !== 'pending') {
      console.log('⏭️ Skipping - ride status is not pending');
      return;
    }

    try {
      // Get all online drivers
      const driversSnapshot = await db
        .collection('users')
        .where('role', '==', 'driver')
        .where('isOnline', '==', true)
        .get();

      if (driversSnapshot.empty) {
        console.log('📭 No online drivers found');
        return;
      }

      console.log(`📢 Notifying ${driversSnapshot.size} online drivers`);

      // Send to all online drivers
      const promises = driversSnapshot.docs.map(async (driverDoc) => {
        const fcmToken = driverDoc.data().fcmToken;

        if (!fcmToken) {
          console.log('⚠️ No FCM token for driver:', driverDoc.id);
          return;
        }

        const message = {
          notification: {
            title: 'New Ride Request 🚗',
            body: `From ${ride.pickup?.name || 'Pickup'} to ${ride.destination?.name || 'Destination'}`,
          },
          data: {
            type: 'ride_request',
            rideId: event.params.rideId,
            fare: String(ride.fare || 0),
            pickup: ride.pickup?.name || 'Pickup',
            destination: ride.destination?.name || 'Destination',
          },
          token: fcmToken,
        };

        try {
          await messaging.send(message);
          console.log('✅ Notification sent to driver:', driverDoc.id);
        } catch (error) {
          console.error(
            '❌ Error sending to driver:',
            driverDoc.id,
            error.code,
          );
        }
      });

      await Promise.all(promises);
      console.log('✅ All driver notifications sent');
    } catch (error) {
      console.error('❌ Error in onNewRideRequest:', error);
    }
  },
);

/**
 * Send notification when ride starts
 */
exports.onRideStarted = onDocumentUpdated('rides/{rideId}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (before.status !== 'inProgress' && after.status === 'inProgress') {
    try {
      const studentDoc = await db
        .collection('users')
        .doc(after.studentId)
        .get();
      const fcmToken = studentDoc.data()?.fcmToken;

      if (!fcmToken) {
        console.log('❌ No FCM token for student');
        return;
      }

      await messaging.send({
        notification: {
          title: 'Ride Started 🚀',
          body: "You're on your way!",
        },
        data: {
          type: 'ride_started',
          rideId: event.params.rideId,
        },
        token: fcmToken,
      });

      console.log('✅ Ride started notification sent');
    } catch (error) {
      console.error('❌ Error sending ride started notification:', error);
    }
  }
});

/**
 * Send notification when ride completes
 */
exports.onRideCompleted = onDocumentUpdated('rides/{rideId}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (before.status !== 'completed' && after.status === 'completed') {
    try {
      // Notify student
      const studentDoc = await db
        .collection('users')
        .doc(after.studentId)
        .get();
      const studentToken = studentDoc.data()?.fcmToken;

      if (studentToken) {
        await messaging.send({
          notification: {
            title: 'Ride Completed ✅',
            body: `Total fare: ₦${after.fare || 0}. Thank you for riding!`,
          },
          data: {
            type: 'ride_completed',
            rideId: event.params.rideId,
            fare: String(after.fare || 0),
          },
          token: studentToken,
        });
        console.log('✅ Student notified');
      }

      // Notify driver
      if (after.driverId) {
        const driverDoc = await db
          .collection('users')
          .doc(after.driverId)
          .get();
        const driverToken = driverDoc.data()?.fcmToken;

        if (driverToken) {
          const driverEarnings = Math.round((after.fare || 0) * 0.85);

          await messaging.send({
            notification: {
              title: 'Ride Completed 💰',
              body: `You earned ₦${driverEarnings}. Great job!`,
            },
            data: {
              type: 'payment_received',
              rideId: event.params.rideId,
              earnings: String(driverEarnings),
            },
            token: driverToken,
          });
          console.log('✅ Driver notified');
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
});

// Auto-updates driver rating when new rating is created
exports.onRatingCreated = onDocumentCreated(
  'ratings/{ratingId}',
  async (event) => {
    const { driverId } = event.data.data();

    if (!driverId) return;

    // Get all ratings for this driver
    const ratingsSnapshot = await db
      .collection('ratings')
      .where('driverId', '==', driverId)
      .get();

    const totalRatings = ratingsSnapshot.size;
    const totalScore = ratingsSnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().rating || 0),
      0,
    );

    const avgRating = Math.round((totalScore / totalRatings) * 10) / 10;

    // ✅ Admin SDK bypasses security rules
    await db.collection('users').doc(driverId).update({
      rating: avgRating,
      totalRatings,
    });

    console.log(`✅ Driver ${driverId} rating: ${avgRating}`);
  },
);
