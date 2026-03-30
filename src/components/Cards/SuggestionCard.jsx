import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const SuggestionCard = ({ icon, label, onPress, size = 'large' }) => {
  const isLarge = size === 'large';

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.container, isLarge && styles.containerLarge]}>
        <View style={[styles.iconCircle, isLarge && styles.iconCircleLarge]}>
          <Feather name={icon} size={isLarge ? 40 : 32} color={COLORS.white} />
        </View>
        <View
          style={[styles.labelContainer, isLarge && styles.labelContainerLarge]}
        >
          <Text style={styles.labelText}>{label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    marginRight: 15,
    width: 100,
  },
  containerLarge: {
    width: 110,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircleLarge: {
    width: 90,
    height: 90,
  },
  labelContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  labelContainerLarge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  labelText: {
    color: COLORS.background,
    fontSize: THEME.fontSize.sm,
    fontWeight: 'bold',
  },
});

export default SuggestionCard;
