import { Feather, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/logo';
import { Button, Text } from '@/components/ui';
import { useSettingsStore } from '@/store/settings';
import { useAppTheme } from '@/theme';

const features = [
  { icon: 'search', titleKey: 'welcome.feature1Title', bodyKey: 'welcome.feature1Body' },
  { icon: 'activity', titleKey: 'welcome.feature2Title', bodyKey: 'welcome.feature2Body' },
  { icon: 'tool', titleKey: 'welcome.feature3Title', bodyKey: 'welcome.feature3Body' },
] as const;

export default function WelcomeScreen() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const signIn = useSettingsStore((state) => state.signIn);
  const signedIn = useSettingsStore((state) => state.signedIn);
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);

  const enterApp = () => {
    signIn({
      name: t('welcome.accountName'),
      email: t('welcome.accountEmail'),
    });
    router.replace('/(tabs)/history');
  };

  // If the session is restored while this screen is visible (for example when
  // local storage finishes loading after the boot timeout), continue to the app.
  if (hasHydrated && signedIn) {
    return <Redirect href="/(tabs)/history" />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#151B10', '#080A0B', '#080A0B'] : ['#EDF1E4', '#F5F6F1', '#F5F6F1']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.8, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glow, { backgroundColor: colors.accentSoft }]} />
      <View style={[styles.glowSmall, { backgroundColor: colors.infoSoft }]} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          bounces={false}>
          <Logo size={46} />

          <View style={styles.hero}>
            <View style={[styles.eyebrow, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}>
              <View style={[styles.dot, { backgroundColor: colors.accent }]} />
              <Text variant="label" tone="accent">
                {t('welcome.eyebrow')}
              </Text>
            </View>

            <Text variant="display" style={styles.title}>
              {t('welcome.title')}
            </Text>
            <Text tone="secondary" style={styles.subtitle}>
              {t('welcome.subtitle')}
            </Text>
          </View>

          <View style={styles.features}>
            {features.map((feature) => (
              <View key={feature.titleKey} style={styles.feature}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}>
                  <Feather name={feature.icon} size={17} color={colors.accent} />
                </View>
                <View style={styles.featureText}>
                  <Text variant="bodyStrong">{t(feature.titleKey)}</Text>
                  <Text variant="caption" tone="secondary">
                    {t(feature.bodyKey)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button label={t('welcome.email')} onPress={enterApp} icon="mail" />
            <Pressable
              accessibilityRole="button"
              onPress={enterApp}
              style={({ pressed }) => [
                styles.facebook,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}>
              <FontAwesome name="facebook" size={18} color={colors.text} />
              <Text variant="bodyStrong">{t('welcome.facebook')}</Text>
            </Pressable>
            <Button label={t('welcome.guest')} onPress={enterApp} variant="ghost" />
            <Text variant="caption" tone="muted" style={styles.terms}>
              {t('welcome.terms')}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -120,
    right: -100,
  },
  glowSmall: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 80,
    left: -120,
  },
  hero: {
    marginTop: 40,
    gap: 16,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 43,
    lineHeight: 46,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 420,
  },
  features: {
    marginTop: 34,
    gap: 18,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  actions: {
    marginTop: 'auto',
    paddingTop: 38,
    gap: 10,
  },
  facebook: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  terms: {
    textAlign: 'center',
    marginTop: 2,
  },
});
