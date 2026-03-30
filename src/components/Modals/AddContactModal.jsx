import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const AddContactModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSave = () => {
    if (name.trim() && phone.trim()) {
      onSave({ name, phone, relationship });
      // Reset form
      setName('');
      setPhone('');
      setRelationship('');
      onClose();
    }
  };

  const handleCancel = () => {
    // Reset form
    setName('');
    setPhone('');
    setRelationship('');
    onClose();
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Contact Details</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Feather name="x" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Enter the details of the person who will be riding
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={styles.inputContainer}>
                  <Feather name="user" size={18} color={COLORS.gray} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    placeholderTextColor={COLORS.gray}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <View style={styles.inputContainer}>
                  <Feather name="phone" size={18} color={COLORS.gray} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    placeholderTextColor={COLORS.gray}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship (Optional)</Text>
                <View style={styles.inputContainer}>
                  <Feather name="users" size={18} color={COLORS.gray} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Friend, Family, Colleague"
                    placeholderTextColor={COLORS.gray}
                    value={relationship}
                    onChangeText={setRelationship}
                  />
                </View>
              </View>

              <View style={styles.infoBox}>
                <Feather name="info" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  The contact will receive ride details and updates via SMS
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!name.trim() || !phone.trim()) && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!name.trim() || !phone.trim()}
              >
                <Text style={styles.saveButtonText}>Save Contact</Text>
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
    maxHeight: '90%',
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
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.white,
    fontSize: THEME.fontSize.sm,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    paddingVertical: 12,
    marginLeft: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: COLORS.primary,
    fontSize: THEME.fontSize.xs,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
  },
});

export default AddContactModal;
