import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

// Driver screens
import ActiveRidesScreen from '../screens/driver/ActiveRidesScreen';
import AvailabitilyScreen from '../screens/driver/AvailabilityScreen';
import AvailableRidesScreen from '../screens/driver/AvailableRidesScreen';
import DocumentsScreen from '../screens/driver/DocumentsScreen';
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import EarningsDetailsScreen from '../screens/driver/EarningsDetailsScreen';
import EarningsScreen from '../screens/driver/EarningsScreen';
import MaintenanceScreen from '../screens/driver/MaintenanceScreen';
import NavigationsScreen from '../screens/driver/NavigationsScreen';
import RideCompleteScreen from '../screens/driver/RideCompleteScreen';
import RideDetailsScreen from '../screens/shared/RideDetailsScreen';
import RideHistoryScreen from '../screens/driver/RideHistoryScreen';
import ScheduleScreen from '../screens/driver/ScheduleScreen';
import TransactionsScreen from '../screens/driver/TransactionsScreen';
import VehicleInfoScreen from '../screens/driver/VehicleInfoScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import CustomTabBar from '../components/Navigation/CustomTabBar';
import WithdrawScreen from '../screens/driver/WithdrawScreen';
import WalletScreen from '../screens/shared/WalletScreen';
import SafetyCenterScreen from '../screens/shared/SafetyCenterScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack for drivers
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        screenOptions={{ swipeEnabled: false }}
      />
      <Stack.Screen name="AvailableRides" component={AvailableRidesScreen} />
      <Stack.Screen name="ActiveRides" component={ActiveRidesScreen} />
      <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
      <Stack.Screen name="ActiveRide" component={ActiveRidesScreen} />
      <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
      <Stack.Screen name="RideComplete" component={RideCompleteScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="Navigations" component={NavigationsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
// Earnings Stack
function EarningsStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen
        name="EarningsDashboard"
        component={EarningsScreen}
        screenOptions={{ swipeEnabled: false }}
      />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="EarningsDetails" component={EarningsDetailsScreen} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
    </Stack.Navigator>
  );
}

// Ride History Stack
function RideHistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
      <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
    </Stack.Navigator>
  );
}
// Profile Stack
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="SafetyCenter" component={SafetyCenterScreen} />
      <Stack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
    </Stack.Navigator>
  );
}
// Main Driver Tab Navigator
const DriverNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Earnings" component={EarningsStack} />
      <Tab.Screen name="RideHistory" component={RideHistoryStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default DriverNavigator;
