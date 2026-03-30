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

const WalletScreen = ({ navigation }) => {
  const [hideBalance, setHideBalance] = React.useState(true);
  const transactions = [
    {
      id: 1,
      name: 'FAVOUR',
      type: 'driver',
      amount: '-$1.2',
      time: '10:54',
      avatar: null,
    },
    {
      id: 2,
      name: 'deji',
      type: 'courier',
      amount: '-$2.3',
      time: '7:17',
      avatar: null,
    },
    {
      id: 3,
      name: 'Bank Deposits',
      type: 'bank',
      amount: '+$4',
      time: '3:54',
      icon: 'trending-up',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <View>
              <Text style={styles.balanceLabel}>Uni cash</Text>
              <Text style={styles.balanceAmount}>
                {hideBalance ? '****' : 'NGN 0.00'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setHideBalance(!hideBalance)}
            >
              <Feather
                name={hideBalance ? 'eye-off' : 'eye'}
                size={24}
                color={COLORS.background}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addFundsButton}
            onPress={() => navigation.navigate('AddMoney')}
          >
            <Text style={styles.addFundsText}>Add funds</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment methods</Text>

          <TouchableOpacity style={styles.paymentMethod}>
            <View style={styles.paymentMethodLeft}>
              <View style={styles.cashIcon}>
                <Feather
                  name="dollar-sign"
                  size={24}
                  color={COLORS.lightGreen}
                />
              </View>
              <Text style={styles.paymentMethodText}>Cash</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addPaymentButton}
            onPress={() => navigation.navigate('AddMoney')}
          >
            <Feather name="plus" size={20} color={COLORS.white} />
            <Text style={styles.addPaymentText}>Add payment meythod</Text>
          </TouchableOpacity>
        </View>

        {/* Last Action */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last Action</Text>

          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                {transaction.avatar ? (
                  <Image
                    source={{ uri: transaction.avatar }}
                    style={styles.avatar}
                  />
                ) : transaction.icon ? (
                  <View style={styles.iconContainer}>
                    <Feather
                      name={transaction.icon}
                      size={24}
                      color={COLORS.white}
                    />
                  </View>
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="user" size={20} color={COLORS.gray} />
                  </View>
                )}
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionName}>{transaction.name}</Text>
                  <Text style={styles.transactionType}>{transaction.type}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.amount.startsWith('+') && styles.positiveAmount,
                  ]}
                >
                  {transaction.amount}
                </Text>
                <Text style={styles.transactionTime}>{transaction.time}</Text>
              </View>
            </View>
          ))}
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
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  balanceLabel: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    marginBottom: 8,
  },
  balanceAmount: {
    color: COLORS.background,
    fontSize: 36,
    fontWeight: 'bold',
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFundsButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.background,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addFundsText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: '600',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
  },
  addPaymentText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    marginLeft: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionType: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    color: COLORS.destructiveRed,
    fontSize: THEME.fontSize.md,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  positiveAmount: {
    color: COLORS.lightGreen,
  },
  transactionTime: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
  },
});

export default WalletScreen;
