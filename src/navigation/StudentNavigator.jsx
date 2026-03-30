// navigation/StudentNavigator.js - FIXED tab bar hiding
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Shared screens
import ProfileScreen from '../screens/shared/ProfileScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
// Student screens
import HomeScreen from '../screens/student/HomeScreen';
import RidePlanScreen from '../screens/student/RidePlanScreen';
import PickupConfirmationScreen from '../screens/student/PickupConfirmationScreen';
import SetDestinationScreen from '../screens/student/SetDestinationScreen';
import FindingScreen from '../screens/student/FindingScreen';
import DriverMatchScreen from '../screens/student/DriverMatchScreen';
import RideTrackingScreen from '../screens/student/RideTrackingScreen';
import PaymentSuccessScreen from '../screens/student/PaymentSuccessScreen';
import ActivityScreen from '../screens/student/ActivityScreen';
import WalletScreen from '../screens/shared/WalletScreen';
import AddMoneyScreen from '../screens/student/AddMoneyScreen';
import ServicesScreen from '../screens/student/ServicesScreen';
import SavedDriversScreen from '../screens/student/SavedDriversScreen';
import PromotionScreen from '../screens/student/PromotionScreen';
import SafetyCenterScreen from '../screens/shared/SafetyCenterScreen';
import QRScanScreen from '../screens/student/QRScanScreen';
import OngoingRidesScreen from '../screens/student/OngoingRidesScreen';
import BankTransferScreen from '../screens/student/BankTransferScreen';
import RateDriverScreen from '../screens/student/RateDriverScreen';
import CustomTabBar from '../components/Navigation/CustomTabBar';
import RideDetailsScreen from '../screens/shared/RideDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack for students
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="QRScan" component={QRScanScreen} />
      <Stack.Screen name="RidePlan" component={RidePlanScreen} />
      <Stack.Screen name="SetDestination" component={SetDestinationScreen} />
      <Stack.Screen
        name="PickupConfirmation"
        component={PickupConfirmationScreen}
      />
      <Stack.Screen name="FindingDriver" component={FindingScreen} />
      <Stack.Screen name="DriverMatch" component={DriverMatchScreen} />
      <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Stack.Screen name="QRScan" component={QRScanScreen} />
      <Stack.Screen name="OngoingRides" component={OngoingRidesScreen} />
      <Stack.Screen name="Promotion" component={PromotionScreen} />
      <Stack.Screen name="BankTransfer" component={BankTransferScreen} />
      <Stack.Screen name="RateDriver" component={RateDriverScreen} />
    </Stack.Navigator>
  );
}
// Services Stack
function ServicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServicesScreen" component={ServicesScreen} />
      <Stack.Screen name="RidePlan" component={RidePlanScreen} />
      <Stack.Screen name="SetDestination" component={SetDestinationScreen} />
      <Stack.Screen
        name="PickupConfirmation"
        component={PickupConfirmationScreen}
      />
      <Stack.Screen name="FindingDriver" component={FindingScreen} />
      <Stack.Screen name="DriverMatch" component={DriverMatchScreen} />
      <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Stack.Screen name="QRScan" component={QRScanScreen} />
      <Stack.Screen name="OngoingRides" component={OngoingRidesScreen} />
      <Stack.Screen name="Promotion" component={PromotionScreen} />
      <Stack.Screen name="BankTransfer" component={BankTransferScreen} />
      <Stack.Screen name="RateDriver" component={RateDriverScreen} />
    </Stack.Navigator>
  );
}
// Activity/History Stack
function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ActivityScreen" component={ActivityScreen} />
      <Stack.Screen name="RidePlan" component={RidePlanScreen} />
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
      <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
      <Stack.Screen name="SavedDrivers" component={SavedDriversScreen} />
      <Stack.Screen name="Promotion" component={PromotionScreen} />
      <Stack.Screen name="SafetyCenter" component={SafetyCenterScreen} />
    </Stack.Navigator>
  );
}
// Main Student Tab Navigator
const StudentNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={() => {
        return { headerShown: false };
      }}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="ServicesScreen" component={ServicesStack} />
      <Tab.Screen name="Activity" component={HistoryStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
