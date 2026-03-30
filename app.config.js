import 'dotenv/config';

export default {
  expo: {
    name: 'Unicode',
    slug: 'Unicode',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.victo.uniride',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
      },
      edgeToEdgeEnabled: true,
      package: 'com.victo.unicode',
      googleServicesFile: './google-services.json',
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        '@rnmapbox/maps',
        {
          RNMapboxMapsDownloadToken: process.env.MAPBOX_ACCESS_TOKEN,
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/SFPRODISPLAYREGULAR.OTF',
            // Add more fonts here as you download them
          ],
        },
      ], // ✅ Correct - just close the array item
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow Uniride to access your photos',
          cameraPermission: 'Allow Uniride to access your camera',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '4cb317ca-03b6-4902-a93d-5bf058b98599',
      },
    },
    owner: 'victorayoola',
  },
};
