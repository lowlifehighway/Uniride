import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_HEIGHT = 60; // Collapsed height enough for handle
const MAX_HEIGHT = SCREEN_HEIGHT * 0.6; // Expanded height

const CollapsibleBottomSheet = ({ children, isExpanded, onToggle }) => {
  const insets = useSafeAreaInsets();
  const collapsedHeight = MIN_HEIGHT;
  const animatedHeight = useRef(new Animated.Value(collapsedHeight)).current;

  useEffect(() => {
    const targetHeight = isExpanded ? MAX_HEIGHT : collapsedHeight;

    Animated.spring(animatedHeight, {
      toValue: targetHeight,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [isExpanded, collapsedHeight]);

  const toggleExpand = () => {
    if (onToggle) {
      onToggle(!isExpanded);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: animatedHeight,
          // paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Click Handle */}
      <TouchableOpacity
        onPress={toggleExpand}
        style={styles.handleContainer}
        activeOpacity={0.7}
      >
        <Feather
          name={isExpanded ? 'chevron-down' : 'chevron-up'}
          size={20}
          color={COLORS.gray}
          style={styles.chevronIcon}
        />
      </TouchableOpacity>

      {/* Render content only if expanded */}
      {isExpanded && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>{children}</View>
        </ScrollView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomColor: COLORS.darkGray,
    borderBottomWidth: 0.5,
  },
  chevronIcon: {
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});

export default CollapsibleBottomSheet;
