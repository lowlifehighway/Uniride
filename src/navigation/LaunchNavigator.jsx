import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';

const Stack = createNativeStackNavigator();

export default function LaunchNavigator({ setInitLoading }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash">
        {(props) => <SplashScreen {...props} setInitLoading={setInitLoading} />}
      </Stack.Screen>
      <Stack.Screen name="Auth" component={AuthNavigator} />
    </Stack.Navigator>
  );
}
