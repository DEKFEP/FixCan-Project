import { Redirect } from 'expo-router';

import { useSettingsStore } from '@/store/settings';

export default function Index() {
  const signedIn = useSettingsStore((state) => state.signedIn);
  return <Redirect href={signedIn ? '/(tabs)/history' : '/welcome'} />;
}
