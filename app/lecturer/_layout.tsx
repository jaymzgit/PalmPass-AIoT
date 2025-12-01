import { Stack } from 'expo-router';

export default function LecturerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="lecturer" options={{ title: 'Lecturer Dashboard', headerShown: false }} />
      <Stack.Screen name="attendance" options={{ title: 'Attendance Management' }} />
      <Stack.Screen name="logging" options={{ title: 'Exit / Return Log' }} />
    </Stack>
  );
}
