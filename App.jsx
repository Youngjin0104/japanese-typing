import { useCallback } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import ErrorBoundary  from "./src/components/ErrorBoundary.jsx";
import AppNavigator   from "./src/navigation/AppNavigator.jsx";
import { AdProvider } from "./src/contexts/AdContext.jsx";
import { C }          from "./src/styles/colors.js";

SplashScreen.preventAutoHideAsync();

// AdMob 초기화 — Expo Go에서는 동작하지 않으므로 에러 무시
// 실제 광고는 EAS 프로덕션 빌드에서만 작동함
try {
  const { MobileAds } = require("react-native-google-mobile-ads");
  MobileAds().initialize().catch(() => {});
} catch {}


const FONTS = {
  "ZenKakuGothicNew-Regular": require("./assets/fonts/ZenKakuGothicNew-Regular.ttf"),
  "ZenKakuGothicNew-Medium":  require("./assets/fonts/ZenKakuGothicNew-Medium.ttf"),
  "ZenKakuGothicNew-Bold":    require("./assets/fonts/ZenKakuGothicNew-Bold.ttf"),
  "ZenKakuGothicNew-Black":   require("./assets/fonts/ZenKakuGothicNew-Black.ttf"),
  "NotoSansKR-Regular":       require("./assets/fonts/NotoSansKR-Regular.ttf"),
  "NotoSansKR-Medium":        require("./assets/fonts/NotoSansKR-Medium.ttf"),
  "NotoSansKR-Bold":          require("./assets/fonts/NotoSansKR-Bold.ttf"),
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONTS);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: C.bg }} onLayout={onLayoutRootView}>
        <StatusBar style="dark" backgroundColor={C.bg} />
        <ErrorBoundary fallbackLabel="앱">
          {/* AdProvider: 광고 상태·showAd()를 전역 제공 */}
          <AdProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AdProvider>
        </ErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}
