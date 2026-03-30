import { TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const LocationInput = ({
  icon,
  placeholder,
  value,
  onPress,
  editable = false,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Feather name={icon} size={20} color={COLORS.white} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        value={value}
        editable={editable}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: THEME.fontSize.md,
    marginLeft: 12,
  },
});

export default LocationInput;
