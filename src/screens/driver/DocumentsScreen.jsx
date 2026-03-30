import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';

// ✅ Import Firebase services
import { getDriverDocuments, addDriverDocument } from '../../services/driver';

const DocumentsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    if (!user?.uid) return;

    setLoading(true);
    const result = await getDriverDocuments(user.uid);

    if (result.success) {
      console.log('✅ Loaded documents:', result.data.length);
      setDocuments(result.data);
    }

    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'expired':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  const handleUploadDocument = () => {
    Alert.alert('Upload Document', 'Document upload feature coming soon');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : documents.length > 0 ? (
          documents.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.documentCard}
              onPress={() =>
                Alert.alert(doc.name, 'Document viewer coming soon')
              }
            >
              <View
                style={[
                  styles.documentIcon,
                  { backgroundColor: getStatusColor(doc.status) + '20' },
                ]}
              >
                <Feather
                  name="file-text"
                  size={24}
                  color={getStatusColor(doc.status)}
                />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentExpiry}>
                  Expires: {doc.expiryDate || 'N/A'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(doc.status) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(doc.status) },
                  ]}
                >
                  {doc.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="file-text" size={64} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>No Documents</Text>
            <Text style={styles.emptyText}>
              Upload your driver documents to get started
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleUploadDocument}
        >
          <Feather name="plus-circle" size={20} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Upload New Document</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 20 },
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
  headerTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: { flex: 1 },
  documentName: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  documentExpiry: { fontSize: THEME.fontSize.sm, color: COLORS.gray },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: THEME.fontSize.xs, fontWeight: '600' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginTop: 12,
  },
  addButtonText: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: THEME.fontSize.md,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default DocumentsScreen;
