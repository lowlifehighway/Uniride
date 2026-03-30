import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const PaymentPinModal = ({ visible, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');

  const handleNumberPress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      // Auto submit when 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => {
          onSuccess();
          setPin('');
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleBiometric = () => {
    onSuccess();
    setPin('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.title}>Enter Payment Pin</Text>

          {/* PIN Display */}
          <View style={styles.pinDisplay}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  pin.length > index && styles.pinDotFilled,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.forgotPin}>
            <Text style={styles.forgotPinText}>Forgot Payment Pin?</Text>
          </TouchableOpacity>

          {/* Number Pad */}
          <View style={styles.numberPad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.numberButton}
                onPress={() => handleNumberPress(num.toString())}
              >
                <Text style={styles.numberText}>{num}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.numberButton, styles.biometricButton]}
              onPress={handleBiometric}
            >
              <Feather name="smartphone" size={24} color={COLORS.background} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => handleNumberPress('0')}
            >
              <Text style={styles.numberText}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.numberButton}
              onPress={handleBackspace}
            >
              <Feather name="delete" size={24} color={COLORS.white} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 500,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  pinDot: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.darkGray,
  },
  pinDotFilled: {
    backgroundColor: COLORS.white,
  },
  forgotPin: {
    alignSelf: 'center',
    marginBottom: 40,
  },
  forgotPinText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  numberButton: {
    width: '30%',
    aspectRatio: 1.5,
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  biometricButton: {
    backgroundColor: COLORS.primary,
  },
  numberText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default PaymentPinModal;
