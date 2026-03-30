import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { collections } from '../config/firebase';

/**
 * Authentication Service - Migrated to Modular API
 * Compatible with React Native Firebase v9+
 */

// ============================================
// ERROR MESSAGES
// ============================================
const AUTH_ERRORS = {
  'auth/email-already-in-use': 'This email is already registered',
  'auth/invalid-email': 'Invalid email address',
  'auth/operation-not-allowed': 'Operation not allowed',
  'auth/weak-password': 'Password is too weak (minimum 6 characters)',
  'auth/user-disabled': 'This account has been disabled',
  'auth/user-not-found': 'No account found with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/too-many-requests': 'Too many attempts. Please try again later',
  'auth/network-request-failed': 'Network error. Please check your connection',
  'auth/requires-recent-login': 'Please log in again to perform this action',
  'auth/invalid-verification-code': 'Invalid verification code',
  'auth/invalid-verification-id':
    'Verification session expired. Please try again',
  'auth/quota-exceeded': 'SMS quota exceeded. Please try again later',
  'auth/captcha-check-failed': 'reCAPTCHA verification failed',
  'auth/invalid-phone-number': 'Invalid phone number format',
  'auth/missing-phone-number': 'Phone number is required',
};

/**
 * Get user-friendly error message
 * @param {Error} error - Firebase error
 * @returns {string} User-friendly error message
 */
const getErrorMessage = (error) => {
  return (
    AUTH_ERRORS[error.code] || error.message || 'An unexpected error occurred'
  );
};

// ============================================
// AUTH STATE MANAGEMENT
// ============================================

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return auth().onAuthStateChanged(callback);
};

/**
 * Get current authenticated user
 * @returns {Object|null} Current Firebase user or null
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  return auth().currentUser !== null;
};

// ============================================
// USER DATA OPERATIONS
// ============================================

/**
 * Get current user data from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object>} { success: boolean, data: object | null, error: string | null }
 */
export const getCurrentUserData = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        data: null,
        error: 'User ID is required',
      };
    }

    const userDoc = await firestore()
      .collection(collections.USERS)
      .doc(userId)
      .get();

    if (userDoc.exists) {
      return {
        success: true,
        data: { id: userDoc.id, ...userDoc.data() },
        error: null,
      };
    }

    return {
      success: false,
      data: null,
      error: 'User not found',
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      success: false,
      data: null,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Get user data by email
 * @param {string} email - User email
 * @returns {Promise<Object>} { success: boolean, data: object | null, error: string | null }
 */
export const getUserByEmail = async (email) => {
  try {
    if (!email) {
      return {
        success: false,
        data: null,
        error: 'Email is required',
      };
    }

    const querySnapshot = await firestore()
      .collection(collections.USERS)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        success: true,
        data: { id: userDoc.id, ...userDoc.data() },
        error: null,
      };
    }

    return {
      success: false,
      data: null,
      error: 'User not found',
    };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return {
      success: false,
      data: null,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Get user data by phone number
 * @param {string} phone - User phone number
 * @returns {Promise<Object>} { success: boolean, data: object | null, error: string | null }
 */
export const getUserByPhone = async (phone) => {
  try {
    if (!phone) {
      return {
        success: false,
        data: null,
        error: 'Phone number is required',
      };
    }

    const querySnapshot = await firestore()
      .collection(collections.USERS)
      .where('phone', '==', phone)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        success: true,
        data: { id: userDoc.id, ...userDoc.data() },
        error: null,
      };
    }

    return {
      success: false,
      data: null,
      error: 'User not found',
    };
  } catch (error) {
    console.error('Error fetching user by phone:', error);
    return {
      success: false,
      data: null,
      error: getErrorMessage(error),
    };
  }
};

// ============================================
// REGISTRATION
// ============================================

/**
 * Validate registration data
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} userData - Additional user data
 * @returns {Object} { valid: boolean, errors: object }
 */
const validateRegistrationData = (email, password, userData) => {
  const errors = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Valid email is required';
  }

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!userData.firstName || userData.firstName.trim().length === 0) {
    errors.firstName = 'First name is required';
  }

  if (!userData.lastName || userData.lastName.trim().length === 0) {
    errors.lastName = 'Last name is required';
  }

  if (!userData.role || !['student', 'driver'].includes(userData.role)) {
    errors.role = 'Valid role is required (student or driver)';
  }

  if (userData.phone && !/^\+?[1-9]\d{1,14}$/.test(userData.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} userData - Additional user data (firstName, lastName, role, phone, etc.)
 * @returns {Promise<Object>} { success: boolean, user: object | null, confirmation: object | null, error: string | null, errors: object | null }
 */
export const registerUser = async (email, password, userData) => {
  try {
    console.log('Starting user registration');

    // Validate input
    const validation = validateRegistrationData(email, password, userData);
    if (!validation.valid) {
      return {
        success: false,
        user: null,
        confirmation: null,
        error: 'Validation failed',
        errors: validation.errors,
      };
    }

    // 1️⃣ Create Firebase auth user (Email + Password)
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    console.log('Firebase auth user created');
    const user = userCredential.user;

    // 2️⃣ Update display name
    if (userData.firstName && userData.lastName) {
      await user.updateProfile({
        displayName: `${userData.firstName} ${userData.lastName}`,
      });
    }

    // 3️⃣ Create Firestore user document
    await firestore()
      .collection(collections.USERS)
      .doc(user.uid)
      .set({
        email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        phone: userData.phone || null,
        phoneVerified: false,
        profileComplete: false,
        emailVerified: false,
        ...userData, // Any additional fields
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    console.log('Firestore user document created');

    // 4️⃣ Send phone verification code (if phone provided)
    let confirmation = null;
    console.log('phone confirmaation init');
    if (userData.phone) {
      try {
        confirmation = await auth().verifyPhoneNumber(userData.phone);
        console.log('Phone verification sent');
      } catch (phoneError) {
        console.warn('Phone verification failed:', phoneError);
        // Don't fail registration if phone verification fails
      }
    }

    return {
      success: true,
      user,
      confirmation,
      error: null,
      errors: null,
    };
  } catch (error) {
    console.error('Registration error:', error);

    // Cleanup: If Firestore write failed but auth succeeded, delete the auth user
    if (error.code?.startsWith('firestore/') && auth().currentUser) {
      try {
        await auth().currentUser.delete();
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    return {
      success: false,
      user: null,
      confirmation: null,
      error: getErrorMessage(error),
      errors: null,
    };
  }
};

// ============================================
// PHONE VERIFICATION
// ============================================

/**
 * Verify phone number with code
 * @param {Object} confirmation - Confirmation object from phone sign-in
 * @param {string} code - Verification code
 * @returns {Promise<Object>} { success: boolean, error: string | null }
 */
export const verifyPhoneCode = async (confirmation, code) => {
  try {
    if (!confirmation) {
      return {
        success: false,
        error: 'Confirmation object is required',
      };
    }

    if (!code || code.trim().length === 0) {
      return {
        success: false,
        error: 'Verification code is required',
      };
    }

    const credential = auth.PhoneAuthProvider.credential(
      confirmation.verificationId,
      code,
    );

    await auth().currentUser.linkWithCredential(credential);

    // Update Firestore
    await firestore()
      .collection(collections.USERS)
      .doc(auth().currentUser.uid)
      .update({
        phoneVerified: true,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    return { success: true, error: null };
  } catch (error) {
    console.error('Phone verification error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Resend phone verification code
 * @param {string} phone - Phone number
 * @returns {Promise<Object>} { success: boolean, confirmation: object | null, error: string | null }
 */
export const resendPhoneVerification = async (phone) => {
  try {
    if (!phone) {
      return {
        success: false,
        confirmation: null,
        error: 'Phone number is required',
      };
    }

    const confirmation = await auth().verifyPhoneNumber(phone);

    return {
      success: true,
      confirmation,
      error: null,
    };
  } catch (error) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      confirmation: null,
      error: getErrorMessage(error),
    };
  }
};

// ============================================
// LOGIN
// ============================================

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} { success: boolean, user: object | null, error: string | null }
 */
export const loginUserEmail = async (email, password) => {
  try {
    if (!email || !password) {
      return {
        success: false,
        user: null,
        error: 'Email and password are required',
      };
    }

    const userCredential = await auth().signInWithEmailAndPassword(
      email.trim(),
      password,
    );

    return {
      success: true,
      user: userCredential.user,
      error: null,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      user: null,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Start phone number login process
 * @param {string} phone - Phone number in E.164 format (e.g., +2349012345678)
 * @returns {Promise<Object>} { success: boolean, confirmation: object | null, error: string | null }
 */
export const loginUserPhone = async (phone) => {
  try {
    if (!phone) {
      return {
        success: false,
        confirmation: null,
        error: 'Phone number is required',
      };
    }

    const confirmation = await auth().signInWithPhoneNumber(phone);

    return {
      success: true,
      confirmation,
      error: null,
    };
  } catch (error) {
    console.error('Phone login error:', error);
    return {
      success: false,
      confirmation: null,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Confirm phone login with verification code
 * @param {Object} confirmation - Confirmation object from loginUserPhone
 * @param {string} code - Verification code
 * @returns {Promise<Object>} { success: boolean, user: object | null, error: string | null }
 */
export const confirmPhoneLogin = async (confirmation, code) => {
  try {
    if (!confirmation) {
      return {
        success: false,
        user: null,
        error: 'Confirmation object is required',
      };
    }

    if (!code || code.trim().length === 0) {
      return {
        success: false,
        user: null,
        error: 'Verification code is required',
      };
    }

    const userCredential = await confirmation.confirm(code);

    return {
      success: true,
      user: userCredential.user,
      error: null,
    };
  } catch (error) {
    console.error('Code confirmation error:', error);
    return {
      success: false,
      user: null,
      error: getErrorMessage(error),
    };
  }
};

// ============================================
// LOGOUT
// ============================================

/**
 * Sign out current user
 * @returns {Promise<Object>} { success: boolean, error: string | null }
 */
export const logoutUser = async () => {
  try {
    await auth().signOut();
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// ============================================
// PROFILE MANAGEMENT
// ============================================

/**
 * Update user profile in Firestore
 * @param {string} userId - User ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} { success: boolean, error: string | null }
 */
export const updateUserProfile = async (userId, data) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    if (!data || Object.keys(data).length === 0) {
      return {
        success: false,
        error: 'Update data is required',
      };
    }

    // Prevent updating protected fields
    const protectedFields = ['createdAt', 'uid', 'id'];
    const sanitizedData = Object.keys(data)
      .filter((key) => !protectedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    await firestore()
      .collection(collections.USERS)
      .doc(userId)
      .update({
        ...sanitizedData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Update user's display name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {Promise<Object>} { success: boolean, error: string | null }
 */
export const updateDisplayName = async (firstName, lastName) => {
  try {
    const user = auth().currentUser;

    if (!user) {
      return {
        success: false,
        error: 'No user logged in',
      };
    }

    const displayName = `${firstName} ${lastName}`;

    await user.updateProfile({ displayName });

    await firestore().collection(collections.USERS).doc(user.uid).update({
      firstName,
      lastName,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Display name update error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// ============================================
// PASSWORD MANAGEMENT
// ============================================

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<Object>} { success: boolean, error: string | null }
 */
export const resetPassword = async (email) => {
  try {
    if (!email) {
      return {
        success: false,
        error: 'Email is required',
      };
    }

    await auth().sendPasswordResetEmail(email.trim().toLowerCase());

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Update password (requires recent login)
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} { success: boolean, error: string | null }
 */
export const updatePassword = async (newPassword) => {
  try {
    const user = auth().currentUser;

    if (!user) {
      return {
        success: false,
        error: 'No user logged in',
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters',
      };
    }

    await user.updatePassword(newPassword);

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Password update error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Re-authenticate user with credentials (required for sensitive operations)
 * @param {string} password - Current password
 * @returns {Promise<Object>} { success: boolean, error: string | null }
 */
export const reauthenticateUser = async (password) => {
  try {
    const user = auth().currentUser;

    if (!user || !user.email) {
      return {
        success: false,
        error: 'No user logged in',
      };
    }

    const credential = auth.EmailAuthProvider.credential(user.email, password);
    await user.reauthenticateWithCredential(credential);

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Re-authentication error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// ============================================
// EMAIL MANAGEMENT
// ============================================

/**
 * Update email address (requires recent login)
 * @param {string} newEmail - New email address
 * @returns {Promise<Object>} { success: boolean, error: string | null }
 */
export const updateEmail = async (newEmail) => {
  try {
    const user = auth().currentUser;

    if (!user) {
      return {
        success: false,
        error: 'No user logged in',
      };
    }

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return {
        success: false,
        error: 'Valid email is required',
      };
    }

    await user.updateEmail(newEmail.trim());

    // Update in Firestore
    await firestore().collection(collections.USERS).doc(user.uid).update({
      email: newEmail.trim(),
      emailVerified: false, // Email needs to be verified again
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Email update error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Send email verification
 * @returns {Promise<Object>} { success: boolean, error: string | null }
 */
export const sendEmailVerification = async () => {
  try {
    const user = auth().currentUser;

    if (!user) {
      return {
        success: false,
        error: 'No user logged in',
      };
    }

    await user.sendEmailVerification();

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Reload user to check email verification status
 * @returns {Promise<Object>} { success: boolean, emailVerified: boolean, error: string | null }
 */
export const checkEmailVerification = async () => {
  try {
    const user = auth().currentUser;

    if (!user) {
      return {
        success: false,
        emailVerified: false,
        error: 'No user logged in',
      };
    }

    await user.reload();
    const emailVerified = user.emailVerified;

    // Update Firestore if verification status changed
    if (emailVerified) {
      await firestore().collection(collections.USERS).doc(user.uid).update({
        emailVerified: true,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      success: true,
      emailVerified,
      error: null,
    };
  } catch (error) {
    console.error('Check verification error:', error);
    return {
      success: false,
      emailVerified: false,
      error: getErrorMessage(error),
    };
  }
};

// ============================================
// ACCOUNT DELETION
// ============================================

/**
 * Delete user account (requires recent login)
 * @returns {Promise<Object>} { success: boolean, error: string | null }
 */
export const deleteAccount = async () => {
  try {
    const user = auth().currentUser;

    if (!user) {
      return {
        success: false,
        error: 'No user logged in',
      };
    }

    const userId = user.uid;

    // Delete user document from Firestore
    await firestore().collection(collections.USERS).doc(userId).delete();

    // Delete Firebase auth account
    await user.delete();

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Account deletion error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if email exists in the system
 * @param {string} email - Email to check
 * @returns {Promise<Object>} { exists: boolean, error: string | null }
 */
export const checkEmailExists = async (email) => {
  try {
    const result = await getUserByEmail(email);
    return {
      exists: result.success,
      error: null,
    };
  } catch (error) {
    console.error('Email check error:', error);
    return {
      exists: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Check if phone number exists in the system
 * @param {string} phone - Phone number to check
 * @returns {Promise<Object>} { exists: boolean, error: string | null }
 */
export const checkPhoneExists = async (phone) => {
  try {
    const result = await getUserByPhone(phone);
    return {
      exists: result.success,
      error: null,
    };
  } catch (error) {
    console.error('Phone check error:', error);
    return {
      exists: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Subscribe to user document changes
 * @param {string} userId - User ID
 * @param {Function} callback - Function to call when user data changes
 * @returns {Function} Unsubscribe function
 */
export const onUserDataChange = (userId, callback) => {
  if (!userId) {
    console.error('User ID is required');
    return () => {};
  }

  return firestore()
    .collection(collections.USERS)
    .doc(userId)
    .onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback({ id: doc.id, ...doc.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('User data snapshot error:', error);
        callback(null);
      },
    );
};
