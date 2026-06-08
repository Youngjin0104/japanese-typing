import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen          from "../screens/HomeScreen.jsx";
import LongSelectScreen    from "../screens/LongSelectScreen.jsx";
import LongPracticeScreen  from "../screens/LongPracticeScreen.jsx";
import CatSelectScreen     from "../screens/CatSelectScreen.jsx";
import ShortPracticeScreen from "../screens/ShortPracticeScreen.jsx";
import WordCardScreen      from "../screens/WordCardScreen.jsx";
import TutorialScreen      from "../screens/TutorialScreen.jsx";
import StoreScreen         from "../screens/StoreScreen.jsx";
import { C } from "../styles/colors.js";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown:    false,
        contentStyle:   { backgroundColor: C.bg },
        animation:      "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Home"          component={HomeScreen} />
      <Stack.Screen name="LongSelect"    component={LongSelectScreen} />
      <Stack.Screen name="LongPractice"  component={LongPracticeScreen} />
      <Stack.Screen name="CatSelect"     component={CatSelectScreen} />
      <Stack.Screen name="ShortPractice" component={ShortPracticeScreen} />
      <Stack.Screen name="WordCard"      component={WordCardScreen} />
      <Stack.Screen name="Tutorial"      component={TutorialScreen} />
      <Stack.Screen
        name="Store"
        component={StoreScreen}
        options={{ animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
}
