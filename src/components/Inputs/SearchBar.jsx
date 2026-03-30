import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const SearchBar = ({ onPress, onSchedulePress, placeholder = 'Where to?' }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Feather name="search" size={24} color={COLORS.gray} />
      <Text style={styles.placeholderText}>{placeholder}</Text>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.scheduleButton} onPress={onSchedulePress}>
        <Feather name="clock" size={16} color={COLORS.white} />
        <Text style={styles.scheduleText}>later</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparent,
    borderRadius: THEME.borderRadius.medium,
    paddingVertical: 13,
    paddingHorizontal: 21,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  placeholderText: {
    color: COLORS.gray,
    fontSize: THEME.fontSize.xl,
    fontWeight: 'bold',
    marginLeft: 13,
  },
  spacer: {
    flex: 1,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: THEME.borderRadius.small,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  scheduleText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    marginLeft: 6,
  },
});

export default SearchBar;
