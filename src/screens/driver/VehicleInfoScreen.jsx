import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { useAuth } from '../../hooks/useAuth';

// ✅ Import Firebase services
import { getDriverProfile } from '../../services/driver';

const VehicleInfoScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load vehicle info on mount
  useEffect(() => {
    loadVehicleInfo();
  }, []);

  const loadVehicleInfo = async () => {
    if (!user?.uid) return;

    setLoading(true);

    const result = await getDriverProfile(user.uid);

    if (result.success) {
      console.log('✅ Loaded vehicle info');
      setVehicleInfo(
        result.data.vehicleInfo || {
          make: '',
          model: '',
          year: 0,
          plate: '',
          color: '',
          seats: 4,
          photos: [],
        },
      );
    } else {
      console.error('❌ Error loading vehicle info:', result.error);
      Alert.alert('Error', 'Failed to load vehicle information');
    }

    setLoading(false);
  };

  // ✅ Handle edit vehicle (placeholder - would navigate to edit screen)
  const handleEditVehicle = () => {
    Alert.alert(
      'Edit Vehicle',
      'Edit vehicle feature coming soon. You can update vehicle info in a form.',
      [{ text: 'OK' }],
    );

    // In production, navigate to edit screen:
    // navigation.navigate('EditVehicle', { vehicleInfo });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 100 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vehicle</Text>
        <TouchableOpacity onPress={handleEditVehicle}>
          <Feather name="edit-2" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.photoSection}>
          {vehicleInfo?.photos && vehicleInfo.photos.length > 0 ? (
            <Image
              source={{ uri: vehicleInfo.photos[0] }}
              style={styles.photo}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Feather name="camera" size={48} color={COLORS.gray} />
              <Text style={styles.photoText}>Add vehicle photos</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Make & Model</Text>
              <Text style={styles.infoValue}>
                {vehicleInfo?.make && vehicleInfo?.model
                  ? `${vehicleInfo.make} ${vehicleInfo.model}`
                  : 'Not set'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Year</Text>
              <Text style={styles.infoValue}>
                {vehicleInfo?.year || 'Not set'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plate Number</Text>
              <Text style={styles.infoValue}>
                {vehicleInfo?.plate || 'Not set'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Color</Text>
              <Text style={styles.infoValue}>
                {vehicleInfo?.color || 'Not set'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Seats</Text>
              <Text style={styles.infoValue}>
                {vehicleInfo?.seats || 4} passengers
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Documents')}
          >
            <Feather name="file-text" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>View Documents</Text>
            <Feather
              name="chevron-right"
              size={20}
              color={COLORS.gray}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Maintenance')}
          >
            <Feather name="tool" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Maintenance Records</Text>
            <Feather
              name="chevron-right"
              size={20}
              color={COLORS.gray}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  photoSection: { padding: 20 },
  photo: { height: 200, borderRadius: 16, resizeMode: 'cover' },
  photoPlaceholder: {
    height: 200,
    backgroundColor: COLORS.grayLight,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  photoText: { marginTop: 12, fontSize: THEME.fontSize.md, color: COLORS.gray },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: { fontSize: THEME.fontSize.md, color: COLORS.gray },
  infoValue: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: { height: 1, backgroundColor: COLORS.border },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
});

export default VehicleInfoScreen;
