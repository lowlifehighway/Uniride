import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import MapView, { Marker } from '../../components/Map/MapView';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';

const OngoingRidesScreen = ({ navigation }) => {
  const [region] = useState({
    latitude: 6.8925,
    longitude: 3.7211,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRideNow = () => {
    navigation.navigate('DriverMatch');
  };
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 18 }}>
          Map features are not available on web. Please use a mobile device to
          access this screen.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={region}
        customMapStyle={mapStyle}
      >
        <Marker
          coordinate={{ latitude: 6.8925, longitude: 3.7211 }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.checkmarkContainer}>
            <Feather name="check" size={24} color={COLORS.white} />
          </View>
        </Marker>
      </MapView>

      {/* Top Bar */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.profileButton}>
            <Feather name="user" size={24} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>University map</Text>
        </View>

        <TouchableOpacity>
          <View style={styles.menuButton}>
            <Feather name="sliders" size={24} color={COLORS.background} />
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.scanButton}>
          <View style={styles.scanIcon}>
            <Feather name="maximize" size={24} color={COLORS.background} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Action Buttons */}
      <Animated.View
        style={[
          styles.bottomActions,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIcon}>
            <Feather name="user-plus" size={24} color={COLORS.background} />
          </View>
          <Text style={styles.actionLabel}>Ride now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIcon}>
            <Feather name="users" size={24} color={COLORS.background} />
          </View>
          <Text style={styles.actionLabel}>Ride with other people</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="grid" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, styles.navItemActive]}
          onPress={handleRideNow}
        >
          <Feather name="smile" size={24} color={COLORS.background} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="activity" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#ebe3cd' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#523735' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.background,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 200,
    right: 20,
  },
  scanButton: {
    marginBottom: 12,
  },
  scanIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: COLORS.background,
    fontSize: THEME.fontSize.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 40,
    paddingVertical: 12,
  },
  navItem: {
    padding: 10,
    borderRadius: 30,
  },
  navItemActive: {
    backgroundColor: COLORS.primary,
  },
});

export default OngoingRidesScreen;
