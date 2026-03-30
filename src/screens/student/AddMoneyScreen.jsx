import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const AddMoneyScreen = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const fundingMethods = [
    {
      id: 'bank',
      icon: 'credit-card',
      title: 'Bank Transfer',
      subtitle: 'Add money via mobile or internet',
    },
    {
      id: 'card',
      icon: 'credit-card',
      title: 'Top-up with Card',
      subtitle: 'Add money directly from your bank card or account',
    },
    {
      id: 'ussd',
      icon: 'smartphone',
      title: 'Bank USSD',
      subtitle: 'With other banks USSD code',
    },
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    if (methodId === 'bank') {
      navigation.navigate('BankTransfer');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add money</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Funding Methods */}
          <View style={styles.methodsContainer}>
            {fundingMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.methodCard}
                onPress={() => handleMethodSelect(method.id)}
              >
                <View style={styles.methodLeft}>
                  <View style={styles.methodIcon}>
                    <Feather
                      name={method.icon}
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>{method.title}</Text>
                    <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={COLORS.white} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
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
  methodsContainer: {
    paddingHorizontal: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  methodSubtitle: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.sm,
    lineHeight: 18,
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
});

export default AddMoneyScreen;
