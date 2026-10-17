import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
//import { configurarCliqueNotificacao } from '@/funcoes/notificacoes';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  //useEffect(() => {
    //const removerListener = configurarCliqueNotificacao((data: any) => {
    //  console.log('Notificação clicada:', data);
    //});

    //return removerListener;
  //}, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="splash" options={{ headerShown: false }} />

        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />

        <Stack.Screen name="(auth)/cadastro" options={{ headerShown: false }} />

        <Stack.Screen
          name="detalhesCards/DetalhesLocais"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="detalhesCards/DetalhesEventos"
          options={{ headerShown: false }}
        />
      </Stack>
    </ThemeProvider>
  );
}