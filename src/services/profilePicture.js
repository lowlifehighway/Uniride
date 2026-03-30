// services/profilePicture.js
// Upload and manage profile pictures with Firebase Storage

import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * Request camera/photo permissions
 */
export const requestPermissions = async () => {
  if (Platform.OS !== 'web') {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are needed to change your profile picture.',
      );
      return false;
    }
  }
  return true;
};

/**
 * Show image picker options (Camera or Gallery)
 */
export const showImagePickerOptions = () => {
  return new Promise((resolve) => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => resolve('camera'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => resolve('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
};

/**
 * Pick image from camera or gallery
 */
export const pickImage = async (source = 'gallery') => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return { success: false, error: 'Permission denied' };
    }

    let result;

    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square crop
        quality: 0.8, // Compress to 80%
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (result.canceled) {
      return { success: false, error: 'Cancelled' };
    }

    return {
      success: true,
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height,
    };
  } catch (error) {
    console.error('❌ Error picking image:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload image to Firebase Storage and update Firestore
 */
export const uploadProfilePicture = async (userId, imageUri) => {
  try {
    console.log('📤 Uploading profile picture for user:', userId);

    // Create a reference to the profile picture
    const filename = `profile_${userId}_${Date.now()}.jpg`;
    const reference = storage().ref(`profile_pictures/${userId}/${filename}`);

    // Upload the file
    console.log('⏳ Uploading...');
    await reference.putFile(imageUri);

    // Get the download URL
    const downloadURL = await reference.getDownloadURL();
    console.log('✅ Upload complete, URL:', downloadURL);

    // Update Firestore user document
    await firestore().collection('users').doc(userId).update({
      profilePicture: downloadURL,
      profilePictureUpdatedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Firestore updated');

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('❌ Error uploading profile picture:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete old profile picture from Storage (cleanup)
 */
export const deleteOldProfilePicture = async (oldUrl) => {
  try {
    if (!oldUrl || !oldUrl.includes('firebase')) return;

    // Extract the path from URL
    const path = storage().refFromURL(oldUrl).fullPath;
    await storage().ref(path).delete();

    console.log('🗑️ Old profile picture deleted');
  } catch (error) {
    // Non-critical error, just log
    console.log('ℹ️ Could not delete old picture:', error.message);
  }
};

/**
 * Complete flow: Pick and upload profile picture
 */
export const changeProfilePicture = async (userId, currentUrl = null) => {
  try {
    // Show picker options
    const source = await showImagePickerOptions();
    if (!source) return { success: false, error: 'Cancelled' };

    // Pick image
    const pickResult = await pickImage(source);
    if (!pickResult.success) {
      return pickResult;
    }

    // Upload to Firebase
    const uploadResult = await uploadProfilePicture(userId, pickResult.uri);
    if (!uploadResult.success) {
      return uploadResult;
    }

    // Delete old picture (if exists)
    if (currentUrl) {
      await deleteOldProfilePicture(currentUrl);
    }

    return {
      success: true,
      url: uploadResult.url,
      message: 'Profile picture updated successfully',
    };
  } catch (error) {
    console.error('❌ Error in changeProfilePicture:', error);
    return { success: false, error: error.message };
  }
};
