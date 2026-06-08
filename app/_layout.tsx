import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider, useApp } from '@/context/AppContext';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}



function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { onboardingCompleted } = useApp();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Si l'onboarding n'est pas complété, on redirige l'utilisateur vers /onboarding
    const inOnboarding = (segments[0] as string) === 'onboarding';
    if (!onboardingCompleted && !inOnboarding) {
      // Utilisez setTimeout pour s'assurer que la navigation est prête
      const timer = setTimeout(() => {
        router.replace('/onboarding' as any);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [onboardingCompleted, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="search" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="details" options={{ headerShown: false }} />
        <Stack.Screen name="plan-transport" options={{ headerShown: false }} />
        <Stack.Screen name="recap" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
