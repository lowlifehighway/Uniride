import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const EndTripModal = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Feather name="check-circle" size={60} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>End Trip?</Text>
          <Text style={styles.subtitle}>
            Have you arrived at your destination?
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trip Duration:</Text>
              <Text style={styles.infoValue}>12 mins</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance Covered:</Text>
              <Text style={styles.infoValue}>3.2 km</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Fare:</Text>
              <Text style={styles.infoValueHighlight}>₦360</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Text style={styles.backButtonText}>Not Yet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endButton} onPress={onConfirm}>
              <Text style={styles.endButtonText}>End Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.md,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
  },
  infoValue: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
  },
  infoValueHighlight: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
  },
  endButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  endButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
  },
});

export default EndTripModal;
