import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const CancelTripModal = ({ visible, onClose, onConfirm, rideStatus }) => {
  const [selectedReason, setSelectedReason] = useState(null);

  const cancelReasons = [
    { id: 1, text: 'Driver is taking too long', icon: 'clock' },
    { id: 2, text: 'Wrong pickup location', icon: 'map-pin' },
    { id: 3, text: 'Driver requested to cancel', icon: 'user-x' },
    { id: 4, text: 'Change of plans', icon: 'x-circle' },
    { id: 5, text: 'Found another ride', icon: 'navigation' },
    { id: 6, text: 'Other reason', icon: 'more-horizontal' },
  ];

  const handleConfirm = () => {
    if (selectedReason) {
      const reason = cancelReasons.find((r) => r.id === selectedReason);
      onConfirm(reason.text);
      setSelectedReason(null);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    onClose();
  };

  const getCancellationFee = () => {
    if (rideStatus === 'arriving') return '₦50';
    if (rideStatus === 'onboard') return '₦200';
    return '₦0';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Cancel Trip</Text>
              <TouchableOpacity onPress={handleClose}>
                <Feather name="x" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Please select a reason for cancellation
            </Text>

            {/* Cancellation Fee Warning */}
            {rideStatus !== 'searching' && (
              <View style={styles.warningBox}>
                <Feather name="alert-circle" size={20} color={COLORS.warning} />
                <View style={styles.warningTextContainer}>
                  <Text style={styles.warningTitle}>Cancellation Fee</Text>
                  <Text style={styles.warningText}>
                    A fee of {getCancellationFee()} will be charged for
                    cancelling this trip
                  </Text>
                </View>
              </View>
            )}

            {/* Reasons */}
            <View style={styles.reasonsList}>
              {cancelReasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reasonCard,
                    selectedReason === reason.id && styles.reasonCardSelected,
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                >
                  <View style={styles.reasonLeft}>
                    <View style={styles.reasonIcon}>
                      <Feather
                        name={reason.icon}
                        size={20}
                        color={COLORS.white}
                      />
                    </View>
                    <Text style={styles.reasonText}>{reason.text}</Text>
                  </View>
                  <View style={styles.radioOuter}>
                    {selectedReason === reason.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.keepButton} onPress={handleClose}>
                <Text style={styles.keepButtonText}>Keep Ride</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  !selectedReason && styles.cancelButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!selectedReason}
              >
                <Text style={styles.cancelButtonText}>Cancel Trip</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
    marginBottom: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    color: COLORS.warning,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  warningText: {
    color: COLORS.warning,
    fontSize: THEME.fontSize.sm,
    lineHeight: 18,
  },
  reasonsList: {
    marginBottom: 20,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reasonCardSelected: {
    borderColor: COLORS.primary,
  },
  reasonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reasonText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  keepButton: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  keepButtonText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.destructiveRed,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
  },
});

export default CancelTripModal;
