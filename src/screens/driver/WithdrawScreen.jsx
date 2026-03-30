import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { useAuth } from '../../hooks/useAuth';

// ✅ Import Firebase services
import { addBankAccount, getDriverProfile } from '../../services/driver';
import { createWithdrawal } from '../../services/earnings';

const WithdrawScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [availableBalance, setAvailableBalance] = useState(0);
  const [bankAccounts, setBankAccounts] = useState([]);

  const minimumWithdrawal = 1000;
  const quickAmounts = [1000, 2500, 5000, 10000];

  // ✅ Load driver data on mount
  useEffect(() => {
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    if (!user?.uid) return;

    setDataLoading(true);

    const result = await getDriverProfile(user.uid);

    if (result.success) {
      console.log('✅ Driver balance:', result.data.availableBalance);
      setAvailableBalance(result.data.availableBalance || 0);
      setBankAccounts(result.data.bankAccounts || []);

      // Auto-select first bank if only one
      if (result.data.bankAccounts?.length === 1) {
        setSelectedBank(result.data.bankAccounts[0]);
      }
    } else {
      Alert.alert('Error', 'Failed to load account data');
    }

    setDataLoading(false);
  };

  // ✅ Handle withdrawal
  const handleWithdraw = async () => {
    const withdrawAmount = parseInt(amount);

    // Validation
    if (!amount || withdrawAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (withdrawAmount < minimumWithdrawal) {
      Alert.alert(
        'Minimum Amount',
        `Minimum withdrawal is ₦${minimumWithdrawal.toLocaleString()}`,
      );
      return;
    }

    if (withdrawAmount > availableBalance) {
      Alert.alert('Insufficient Balance', 'Amount exceeds available balance');
      return;
    }

    if (!selectedBank) {
      Alert.alert('Select Account', 'Please select a bank account');
      return;
    }

    setLoading(true);

    const result = await createWithdrawal(
      user.uid,
      withdrawAmount,
      selectedBank,
    );

    setLoading(false);

    if (result.success) {
      console.log('✅ Withdrawal created:', result.data.transactionId);

      Alert.alert(
        'Withdrawal Successful',
        `₦${withdrawAmount.toLocaleString()} will be transferred to your ${selectedBank.bankName} account within 24 hours`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      Alert.alert('Error', result.error);
    }
  };

  // ✅ Handle adding new bank account
  const handleAddBank = () => {
    Alert.prompt(
      'Add Bank Account',
      'Enter account details (Demo)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (text) => {
            if (!text) return;

            // In production, you'd have a proper form
            const newAccount = {
              bankName: 'Demo Bank',
              accountNumber: text,
              accountName: user.displayName || 'Driver',
            };

            const result = await addBankAccount(user.uid, newAccount);

            if (result.success) {
              Alert.alert('Success', 'Bank account added');
              loadDriverData(); // Reload to show new account
            }
          },
        },
      ],
      'plain-text',
    );
  };

  if (dataLoading) {
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ₦{availableBalance.toLocaleString()}
          </Text>
          <Text style={styles.balanceNote}>
            Minimum withdrawal: ₦{minimumWithdrawal.toLocaleString()}
          </Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={COLORS.gray}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Quick Amounts */}
          <View style={styles.quickAmounts}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  amount === quickAmount.toString() &&
                    styles.quickAmountButtonActive,
                ]}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    amount === quickAmount.toString() &&
                      styles.quickAmountTextActive,
                  ]}
                >
                  ₦{quickAmount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bank Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Bank Account</Text>

          {bankAccounts.length === 0 ? (
            <View style={styles.noBanksContainer}>
              <Feather name="alert-circle" size={48} color={COLORS.gray} />
              <Text style={styles.noBanksText}>No bank accounts added</Text>
              <Text style={styles.noBanksSubtext}>
                Add a bank account to withdraw funds
              </Text>
            </View>
          ) : (
            bankAccounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.bankCard,
                  selectedBank?.id === account.id && styles.bankCardSelected,
                ]}
                onPress={() => setSelectedBank(account)}
              >
                <View style={styles.bankIcon}>
                  <Feather name="briefcase" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.bankInfo}>
                  <Text style={styles.bankName}>{account.bankName}</Text>
                  <Text style={styles.accountNumber}>
                    {account.accountNumber}
                  </Text>
                  <Text style={styles.accountName}>{account.accountName}</Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    selectedBank?.id === account.id &&
                      styles.radioButtonSelected,
                  ]}
                >
                  {selectedBank?.id === account.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            style={styles.addBankButton}
            onPress={handleAddBank}
          >
            <Feather name="plus-circle" size={20} color={COLORS.primary} />
            <Text style={styles.addBankText}>Add New Bank Account</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {amount && selectedBank && parseInt(amount) >= minimumWithdrawal && (
          <View style={styles.section}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Withdrawal Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>
                  ₦{parseInt(amount).toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Processing Fee</Text>
                <Text style={styles.summaryValue}>₦0</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>You'll Receive</Text>
                <Text style={styles.summaryTotalValue}>
                  ₦{parseInt(amount).toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryNote}>
                <Feather name="info" size={16} color={COLORS.info} />
                <Text style={styles.summaryNoteText}>
                  Funds will be transferred within 24 hours
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Withdraw Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            (!amount ||
              !selectedBank ||
              loading ||
              parseInt(amount) < minimumWithdrawal) &&
              styles.withdrawButtonDisabled,
          ]}
          onPress={handleWithdraw}
          disabled={
            !amount ||
            !selectedBank ||
            loading ||
            parseInt(amount) < minimumWithdrawal
          }
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.withdrawButtonText}>
                Withdraw {amount ? `₦${parseInt(amount).toLocaleString()}` : ''}
              </Text>
              <Feather name="arrow-right" size={20} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: { width: 40 },
  balanceCard: {
    backgroundColor: COLORS.primary,
    margin: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: THEME.fontSize.md,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: -1,
    marginBottom: 8,
  },
  balanceNote: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  currencySymbol: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: THEME.fontSize.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 0,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAmountButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickAmountText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  quickAmountTextActive: { color: COLORS.white },
  noBanksContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  noBanksText: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noBanksSubtext: {
    fontSize: THEME.fontSize.md,
    color: COLORS.gray,
    textAlign: 'center',
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bankCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankInfo: { flex: 1 },
  bankName: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: THEME.fontSize.sm,
    color: COLORS.gray,
    marginBottom: 2,
  },
  accountName: { fontSize: THEME.fontSize.sm, color: COLORS.gray },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: { borderColor: COLORS.primary },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  addBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addBankText: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryLabel: { fontSize: THEME.fontSize.md, color: COLORS.gray },
  summaryValue: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryDivider: { height: 1, backgroundColor: COLORS.border },
  summaryTotalLabel: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryTotalValue: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  summaryNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '15',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  summaryNoteText: {
    flex: 1,
    fontSize: THEME.fontSize.sm,
    color: COLORS.info,
    lineHeight: 18,
  },
  bottomSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 25,
    gap: 8,
  },
  withdrawButtonDisabled: { backgroundColor: COLORS.gray },
  withdrawButtonText: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default WithdrawScreen;
