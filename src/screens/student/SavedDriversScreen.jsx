import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';

const SavedDriversScreen = ({ navigation }) => {
  const drivers = [
    { id: 1, name: 'Samson olokpade', vehicle: 'TVS 129', avatar: null },
    { id: 2, name: 'Destiny imala', vehicle: 'TVS 002', avatar: null },
    { id: 3, name: 'Kaleb okeke', vehicle: 'TVS 272', avatar: null },
    { id: 4, name: 'Godsent hilary', vehicle: 'TVS 232', avatar: null },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Drivers 👨</Text>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBox}>
            <Feather name="users" size={32} color={COLORS.primary} />
          </View>
        </View>

        {/* Drivers List */}
        <ScrollView
          style={styles.driversList}
          showsVerticalScrollIndicator={false}
        >
          {drivers.map((driver) => (
            <TouchableOpacity
              key={driver.id}
              style={styles.driverCard}
              onPress={() =>
                navigation.navigate('PickupConfirmation', { driver })
              }
            >
              <View style={styles.driverLeft}>
                {driver.avatar ? (
                  <Image
                    source={{ uri: driver.avatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="user" size={24} color={COLORS.gray} />
                  </View>
                )}
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{driver.name}</Text>
                  <Text style={styles.driverVehicle}>{driver.vehicle}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  iconBox: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.darkGray,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driversList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  driverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverVehicle: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.md,
  },
});

export default SavedDriversScreen;
