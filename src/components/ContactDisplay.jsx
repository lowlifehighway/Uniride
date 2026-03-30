import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { THEME } from '../constants/themes';

const ContactDisplay = ({ contact, onEdit, onRemove }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name="user" size={24} color={COLORS.primary} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.phone}>{contact.phone}</Text>
        {contact.relationship && (
          <Text style={styles.relationship}>{contact.relationship}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Feather name="edit-2" size={18} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onRemove}>
          <Feather name="trash-2" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phone: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
    marginBottom: 2,
  },
  relationship: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ContactDisplay;
