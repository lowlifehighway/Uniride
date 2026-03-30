// components/Navigation/BottomNav.js - CLEANED UP (removed duplicate hide logic)

import { useRef, useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/themes';
import { useAuth } from '../../hooks/useAuth';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SHOW_TAB_BAR_SCREENS = [
  'HomeScreen',
  'ServicesScreen',
  'ActivityScreen',
  'ProfileScreen',
  'DriverHome',
  'EarningsDashboard',
  'RideHistory',
  '',
];
const BottomNav = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const activeRoute = state?.routes[state?.index];
  const { userRole } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  const handleNavigate = (route) => {
    // Find the route key
    const routeKey = state?.routes.find((r) => r.name === route)?.key;

    if (routeKey) {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.navigate(route);
      }
    }
  };

  const navItems =
    userRole === 'student'
      ? [
          { route: 'Home', icon: 'home' },
          { route: 'ServicesScreen', icon: 'grid' },
          { route: 'Activity', icon: 'activity' },
          { route: 'Profile', icon: 'user' },
        ]
      : [
          { route: 'Home', icon: 'home' },
          { route: 'Earnings', icon: 'grid' },
          { route: 'RideHistory', icon: 'activity' },
          { route: 'Profile', icon: 'user' },
        ];

  // Store animations in a ref to persist across re-renders
  const animations = useRef(
    navItems.reduce((acc, item) => {
      acc[item.route] = new Animated.Value(0);
      return acc;
    }, {}),
  ).current;

  const handleClick = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Update animations when activeRoute changes
  useEffect(() => {
    navItems.forEach((item) => {
      const isActive = activeRoute.name === item.route;
      Animated.timing(animations[item.route], {
        toValue: isActive ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [activeRoute]);

  useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(activeRoute) ?? '';
    console.log(routeName);
    setIsVisible(SHOW_TAB_BAR_SCREENS.includes(routeName));
  }, [activeRoute]);

  return (
    <View
      style={{
        backgroundColor: COLORS.background,
        paddingBottom: insets.bottom,
      }}
    >
      {isVisible && (
        <View style={styles.container}>
          <View style={styles.navItemsContainer}>
            {navItems.map((item) => {
              const isActive = activeRoute === item.route;

              return (
                <TouchableOpacity
                  key={item.route}
                  style={styles.navItem}
                  onPress={() => {
                    handleClick();
                    handleNavigate(item.route);
                  }}
                >
                  <Animated.View
                    style={[
                      styles.activeBackground,
                      { opacity: animations[item.route] },
                    ]}
                  />
                  <Feather
                    name={item.icon}
                    size={24}
                    color={isActive ? COLORS.background : COLORS.white}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.large,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  navItemsContainer: {
    flexDirection: 'row',
    height: 64,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    position: 'relative',
  },
  activeBackground: {
    position: 'absolute',
    alignSelf: 'center',
    height: '80%',
    width: '80%',
    backgroundColor: COLORS.primary,
    borderRadius: THEME.borderRadius.medium,
    pointerEvents: 'none',
  },
});

export default BottomNav;
