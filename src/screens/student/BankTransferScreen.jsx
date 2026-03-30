import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Clipboard,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';

const BankTransferScreen = ({ navigation }) => {
  const accountNumber = '0000011111';
  const bankName = 'Providus Bank';
  const accountName = 'Frank smith';

  const handleCopyNumber = () => {
    Clipboard.setString(accountNumber);
    Alert.alert('Copied!', 'Account number copied to clipboard');
  };

  const handleShareDetails = () => {
    Alert.alert(
      'Share',
      `Account: ${accountNumber}\nBank: ${bankName}\nName: ${accountName}`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bank transfer</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Account Details Card */}
        <View style={styles.accountCard}>
          <View style={styles.accountRow}>
            <View style={styles.accountIcon}>
              <Feather name="credit-card" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Account number</Text>
              <Text style={styles.accountNumber}>{accountNumber}</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShareDetails}
            >
              <Text style={styles.actionButtonText}>Share details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.copyButton]}
              onPress={handleCopyNumber}
            >
              <Text style={styles.actionButtonText}>Copy number</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Feather name="home" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Bank</Text>
              <Text style={styles.detailValue}>{bankName}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Feather name="user" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{accountName}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>
            Add money via bank transfer in just 3 steps
          </Text>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>1.</Text>
            <Text style={styles.stepText}>
              Copy the account details above ~0000011111 is your Providus
              account number
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>2.</Text>
            <Text style={styles.stepText}>
              Open the bank app you want to transfer money from
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>3.</Text>
            <Text style={styles.stepText}>
              Transfer the Details amounts to your Workman account
            </Text>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
  },
  accountCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  accountIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
    marginBottom: 4,
  },
  accountNumber: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  copyButton: {
    backgroundColor: COLORS.background,
  },
  actionButtonText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray + '30',
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
    marginBottom: 4,
  },
  detailValue: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.darkGray,
  },
  dividerText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.md,
    marginHorizontal: 16,
  },
  instructionsCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  instructionsTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    color: COLORS.primary,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    marginRight: 12,
    width: 24,
  },
  stepText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.md,
    lineHeight: 22,
    flex: 1,
  },
});

export default BankTransferScreen;
