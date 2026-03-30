import { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

const SafetyCenterScreen = ({ navigation }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    { id: 1, question: 'Is Uniride Nationwide ?' },
    { id: 2, question: 'Is It free ?' },
    { id: 3, question: 'How do workpal get paid ?' },
    { id: 4, question: 'Uniride payment policy ?' },
    { id: 5, question: 'How to get started as a pro ?' },
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
          <Text style={styles.headerTitle}>Safety center</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Feather name="book-open" size={20} color={COLORS.background} />
            <Text style={styles.quickActionText}>Quick Guide</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <Feather name="phone" size={20} color={COLORS.background} />
            <Text style={styles.quickActionText}>Contact Us</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <Feather name="file-text" size={20} color={COLORS.background} />
            <Text style={styles.quickActionText}>
              Terms of Use & Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* FAQs Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          {faqs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() =>
                setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
              }
            >
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Feather
                name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.background}
              />
            </TouchableOpacity>
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
    marginBottom: 20,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickActionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  quickActionText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  faqSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    color: COLORS.background,
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    flex: 1,
  },
});

export default SafetyCenterScreen;
