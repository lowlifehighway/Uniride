import firestore from '@react-native-firebase/firestore';
import { collections } from '../config/firebase';

/**
 * Earnings Service - React Native Firebase
 * Handles all earnings and financial operations for drivers
 */

// ==================== EARNINGS ====================

/**
 * Get driver earnings summary
 */
export const getEarningsSummary = async (driverId) => {
  try {
    const driverSnap = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .get();

    if (!driverSnap.exists) {
      return { success: false, error: 'Driver not found' };
    }

    const driverData = driverSnap.data();

    return {
      success: true,
      data: {
        availableBalance: driverData.availableBalance || 0,
        pendingBalance: driverData.pendingBalance || 0,
        totalEarnings: driverData.totalEarnings || 0,
        totalWithdrawn: driverData.totalWithdrawn || 0,
      },
    };
  } catch (error) {
    console.error('Error getting earnings summary:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get earnings for a specific period
 */
export const getEarningsByPeriod = async (driverId, period = 'week') => {
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
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const transactionsSnap = await firestore()
      .collection('transactions')
      .where('driverId', '==', driverId)
      .where('type', '==', 'ride')
      .where('status', '==', 'completed')
      .where('createdAt', '>=', firestore.Timestamp.fromDate(startDate))
      .orderBy('createdAt', 'desc')
      .get();

    let totalEarnings = 0;
    let totalRides = 0;

    const earnings = transactionsSnap.docs.map((doc) => {
      const data = doc.data();
      totalEarnings += data.amount;
      totalRides += 1;

      return {
        id: doc.id,
        ...data,
      };
    });

    return {
      success: true,
      data: {
        earnings,
        summary: {
          totalEarnings,
          totalRides,
          averagePerRide:
            totalRides > 0 ? Math.round(totalEarnings / totalRides) : 0,
        },
      },
    };
  } catch (error) {
    console.error('Error getting earnings by period:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get daily earnings breakdown
 */
export const getDailyEarningsBreakdown = async (driverId, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const transactionsSnap = await firestore()
      .collection('transactions')
      .where('driverId', '==', driverId)
      .where('type', '==', 'ride')
      .where('status', '==', 'completed')
      .where('createdAt', '>=', firestore.Timestamp.fromDate(startDate))
      .orderBy('createdAt', 'asc')
      .get();

    // Group by day
    const dailyData = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    transactionsSnap.forEach((doc) => {
      const transaction = doc.data();
      const date = transaction.createdAt.toDate();
      const dayKey = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];

      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          date: dayKey,
          day: dayName,
          earnings: 0,
          rides: 0,
        };
      }

      dailyData[dayKey].earnings += transaction.amount;
      dailyData[dayKey].rides += 1;
    });

    // Convert to array and sort by date
    const dailyArray = Object.values(dailyData).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    return { success: true, data: dailyArray };
  } catch (error) {
    console.error('Error getting daily earnings breakdown:', error);
    return { success: false, error: error.message };
  }
};

// ==================== TRANSACTIONS ====================

/**
 * Get all transactions
 */
export const getTransactions = async (
  driverId,
  filterType = 'all',
  limitCount = 50,
) => {
  try {
    let query = firestore()
      .collection('transactions')
      .where('driverId', '==', driverId);

    if (filterType !== 'all') {
      query = query.where('type', '==', filterType);
    }

    const transactionsSnap = await query
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    const transactions = transactionsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: transactions };
  } catch (error) {
    console.error('Error getting transactions:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get transaction details
 */
export const getTransactionDetails = async (transactionId) => {
  try {
    const transactionSnap = await firestore()
      .collection('transactions')
      .doc(transactionId)
      .get();

    if (!transactionSnap.exists) {
      return { success: false, error: 'Transaction not found' };
    }

    return {
      success: true,
      data: {
        id: transactionSnap.id,
        ...transactionSnap.data(),
      },
    };
  } catch (error) {
    console.error('Error getting transaction details:', error);
    return { success: false, error: error.message };
  }
};

// ==================== WITHDRAWALS ====================

/**
 * Create withdrawal request
 */
export const createWithdrawal = async (driverId, amount, bankAccount) => {
  try {
    // Validate amount
    if (amount <= 0) {
      return { success: false, error: 'Invalid withdrawal amount' };
    }

    // Get driver's available balance
    const driverSnap = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .get();

    if (!driverSnap.exists) {
      return { success: false, error: 'Driver not found' };
    }

    const availableBalance = driverSnap.data().availableBalance || 0;

    // Check if sufficient balance
    if (amount > availableBalance) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Create withdrawal transaction
    const transactionRef = firestore().collection('transactions').doc();

    await transactionRef.set({
      driverId,
      type: 'withdrawal',
      amount: -amount, // Negative for withdrawals
      bankAccount: {
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber,
        accountName: bankAccount.accountName,
      },
      status: 'pending',
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update driver's balance
    await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .update({
        availableBalance: firestore.FieldValue.increment(-amount),
        pendingBalance: firestore.FieldValue.increment(amount),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    console.log('✅ Withdrawal created:', transactionRef.id);
    console.log('💰 Amount:', amount);

    return {
      success: true,
      data: {
        transactionId: transactionRef.id,
        amount,
      },
    };
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return { success: false, error: error.message };
  }
};
/**
 * Request withdrawal (for EarningsScreen)
 */
export const requestWithdrawal = async (driverId, amount) => {
  try {
    // Get driver data to check available balance
    const driverSnap = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .get();

    if (!driverSnap.exists) {
      return { success: false, error: 'Driver not found' };
    }

    const driverData = driverSnap.data();
    const availableBalance = driverData.availableBalance || 0;

    if (amount > availableBalance) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Create withdrawal request
    const withdrawalRef = await firestore().collection('withdrawals').add({
      driverId,
      amount,
      status: 'pending',
      requestedAt: firestore.FieldValue.serverTimestamp(),
      processedAt: null,
    });

    // Optionally, you might want to update driver's pending withdrawal amount
    // await firestore()
    //   .collection(collections.USERS)
    //   .doc(driverId)
    //   .update({
    //     pendingWithdrawal: firestore.FieldValue.increment(amount),
    //   });

    return {
      success: true,
      data: {
        withdrawalId: withdrawalRef.id,
        message: 'Withdrawal request submitted successfully',
      },
    };
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    return { success: false, error: error.message };
  }
};
/**
 * Get withdrawal history
 */
export const getWithdrawalHistory = async (driverId, limitCount = 20) => {
  try {
    const transactionsSnap = await firestore()
      .collection('transactions')
      .where('driverId', '==', driverId)
      .where('type', '==', 'withdrawal')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    const withdrawals = transactionsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: withdrawals };
  } catch (error) {
    console.error('Error getting withdrawal history:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel pending withdrawal
 */
export const cancelWithdrawal = async (transactionId, driverId) => {
  try {
    const transactionSnap = await firestore()
      .collection('transactions')
      .doc(transactionId)
      .get();

    if (!transactionSnap.exists) {
      return { success: false, error: 'Transaction not found' };
    }

    const transaction = transactionSnap.data();

    // Verify ownership
    if (transaction.driverId !== driverId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Can only cancel pending withdrawals
    if (transaction.status !== 'pending') {
      return { success: false, error: 'Cannot cancel processed withdrawal' };
    }

    // Update transaction status
    await firestore().collection('transactions').doc(transactionId).update({
      status: 'cancelled',
      cancelledAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Restore driver's balance
    const amount = Math.abs(transaction.amount);
    await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .update({
        availableBalance: firestore.FieldValue.increment(amount),
        pendingBalance: firestore.FieldValue.increment(-amount),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    console.log('❌ Withdrawal cancelled:', transactionId);

    return { success: true };
  } catch (error) {
    console.error('Error cancelling withdrawal:', error);
    return { success: false, error: error.message };
  }
};

// ==================== BONUSES ====================

/**
 * Add bonus to driver account
 * (This would typically be called from admin/backend)
 */
export const addBonus = async (driverId, amount, reason) => {
  try {
    // Create bonus transaction
    const transactionRef = firestore().collection('transactions').doc();

    await transactionRef.set({
      driverId,
      type: 'bonus',
      amount,
      reason,
      status: 'completed',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update driver's balance
    await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .update({
        availableBalance: firestore.FieldValue.increment(amount),
        totalEarnings: firestore.FieldValue.increment(amount),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    console.log('🎁 Bonus added:', amount);

    return { success: true };
  } catch (error) {
    console.error('Error adding bonus:', error);
    return { success: false, error: error.message };
  }
};

// ==================== STATISTICS ====================

/**
 * Get earnings statistics
 */
export const getEarningsStats = async (driverId) => {
  try {
    const driverSnap = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .get();

    if (!driverSnap.exists) {
      return { success: false, error: 'Driver not found' };
    }

    const driverData = driverSnap.data();

    // Get total withdrawals
    const withdrawalsSnap = await firestore()
      .collection('transactions')
      .where('driverId', '==', driverId)
      .where('type', '==', 'withdrawal')
      .where('status', '==', 'completed')
      .get();

    let totalWithdrawn = 0;

    withdrawalsSnap.forEach((doc) => {
      totalWithdrawn += Math.abs(doc.data().amount);
    });

    return {
      success: true,
      data: {
        totalEarnings: driverData.totalEarnings || 0,
        availableBalance: driverData.availableBalance || 0,
        pendingBalance: driverData.pendingBalance || 0,
        totalWithdrawn,
        totalRides: driverData.totalRides || 0,
        averagePerRide:
          driverData.totalRides > 0
            ? Math.round(
                (driverData.totalEarnings || 0) / driverData.totalRides,
              )
            : 0,
      },
    };
  } catch (error) {
    console.error('Error getting earnings stats:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount) => {
  return `₦${Math.abs(amount).toLocaleString()}`;
};

/**
 * Calculate platform fee
 */
export const calculatePlatformFee = (fare, feePercentage = 15) => {
  return Math.round((fare * feePercentage) / 100);
};

/**
 * Calculate driver earnings from fare
 */
export const calculateDriverEarnings = (fare, feePercentage = 15) => {
  const platformFee = calculatePlatformFee(fare, feePercentage);
  return fare - platformFee;
};

/**
 * Get driver earnings (for EarningsScreen)
 * Returns: { available, pending, total }
 */
export const getDriverEarnings = async (driverId) => {
  try {
    const driverSnap = await firestore()
      .collection(collections.USERS)
      .doc(driverId)
      .get();

    if (!driverSnap.exists) {
      return {
        success: true,
        data: { available: 0, pending: 0, total: 0 },
      };
    }

    const driverData = driverSnap.data();

    return {
      success: true,
      data: {
        available: driverData.availableBalance || 0,
        pending: driverData.pendingBalance || 0,
        total: driverData.totalEarnings || 0,
      },
    };
  } catch (error) {
    console.error('Error getting driver earnings:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get driver statistics by period (for EarningsScreen)
 * Returns: { today: {...}, week: {...}, month: {...} }
 */
export const getDriverStatistics = async (driverId) => {
  try {
    const now = new Date();

    // Calculate start dates
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all transactions for the month (includes week and today)
    const transactionsSnap = await firestore()
      .collection('transactions')
      .where('driverId', '==', driverId)
      .where('type', '==', 'ride')
      .where('status', '==', 'completed')
      .where('createdAt', '>=', firestore.Timestamp.fromDate(monthStart))
      .get();

    // Initialize stats
    const stats = {
      today: { rides: 0, earnings: 0, hours: 0 },
      week: { rides: 0, earnings: 0, hours: 0 },
      month: { rides: 0, earnings: 0, hours: 0 },
    };

    // Process transactions
    transactionsSnap.forEach((doc) => {
      const transaction = doc.data();
      const transDate = transaction.createdAt.toDate();
      const amount = transaction.amount || 0;

      // Month stats (includes all)
      stats.month.rides += 1;
      stats.month.earnings += amount;

      // Week stats
      if (transDate >= weekStart) {
        stats.week.rides += 1;
        stats.week.earnings += amount;
      }

      // Today stats
      if (transDate >= todayStart) {
        stats.today.rides += 1;
        stats.today.earnings += amount;
      }
    });

    // Estimate hours (rough calculation: 30 mins per ride)
    stats.today.hours = parseFloat((stats.today.rides * 0.5).toFixed(1));
    stats.week.hours = parseFloat((stats.week.rides * 0.5).toFixed(1));
    stats.month.hours = parseFloat((stats.month.rides * 0.5).toFixed(1));

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error getting driver statistics:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get recent transactions (for EarningsScreen)
 * Returns: Array of recent transactions
 */
export const getRecentTransactions = async (driverId, limitCount = 10) => {
  try {
    const transactionsSnap = await firestore()
      .collection('transactions')
      .where('driverId', '==', driverId)
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    const transactions = transactionsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: transactions };
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    return { success: false, error: error.message };
  }
};

export default {
  // Earnings
  getEarningsSummary,
  getEarningsByPeriod,
  getDailyEarningsBreakdown,

  // Transactions
  getTransactions,
  getTransactionDetails,

  // Withdrawals
  createWithdrawal,
  requestWithdrawal,
  getWithdrawalHistory,
  cancelWithdrawal,

  // Bonuses
  addBonus,

  // Statistics
  getEarningsStats,

  // Utilities
  formatCurrency,
  calculatePlatformFee,
  calculateDriverEarnings,
};
