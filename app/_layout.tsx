import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { soundManager } from '@/lib/sounds';

// Disable static rendering for web compatibility
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    soundManager.init();

    return () => {
      soundManager.cleanup();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a0a' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="challenge/[id]" />
        <Stack.Screen name="results/[attemptId]" />
        <Stack.Screen name="leaderboard/[challengeId]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
