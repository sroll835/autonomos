import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="edit" />
      <Stack.Screen name="vehicles" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="emergency-contacts" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
