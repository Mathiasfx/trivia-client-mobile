import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LoginForm } from "./components/LoginForm/LoginForm";
import { Lobby } from "./components/Lobby/Lobby";
import { Game } from "./components/Game/Game";
import type { RootStackParamList } from "./types/navigation";

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id="root"
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginForm} />
        <Stack.Screen name="Lobby" component={Lobby} />
        <Stack.Screen name="Game" component={Game} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
