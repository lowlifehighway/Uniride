import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';

const PromoCard = ({ title, buttonText, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.container}>
        <Image
          source={require('../../../assets/Star.png')}
          style={styles.backgroundShape}
        />
        <View style={styles.content}>
          <View style={styles.textSection}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.button}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </View>
          </View>
          <View style={styles.imageSection}>
            <View style={styles.image}>
              <Image
                source={require('../../../assets/keke-image.png')}
                style={{ width: 150, height: 150, position: 'absolute' }}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  backgroundShape: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 230,
    height: 230,
    borderBottomRightRadius: 20,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  textSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  button: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: THEME.fontSize.sm,
    fontWeight: 'bold',
  },
  imageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 80,
  },
});

export default PromoCard;
