import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily, useAppTheme } from '@/theme';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 64 + insets.bottom,
          paddingTop: 7,
          paddingBottom: insets.bottom + 7,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.semibold,
          fontSize: 10,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          gap: 2,
        },
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}>
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          tabBarIcon: ({ color }) => (
            <Feather name="clock" size={21} color={typeof color === 'string' ? color : colors.textMuted} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('tabs.scan'),
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.cameraIcon,
                {
                  backgroundColor: focused ? colors.accent : colors.accentSoft,
                  borderColor: focused ? colors.accent : colors.accentBorder,
                },
              ]}>
              <Feather
                name="camera"
                size={18}
                color={focused ? colors.accentText : colors.accent}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: t('tabs.assistant'),
          tabBarIcon: ({ color }) => (
            <Feather name="message-circle" size={21} color={typeof color === 'string' ? color : colors.textMuted} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cameraIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
});
