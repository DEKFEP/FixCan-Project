import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Screen,
  SectionHeader,
  Text,
} from '@/components/ui';
import { initials } from '@/lib/date';
import { confirmAction } from '@/lib/confirm';
import { useScansStore } from '@/store/scans';
import { useSettingsStore } from '@/store/settings';
import { useAppTheme } from '@/theme';
import type { Locale, ThemeMode } from '@/types/scan';

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const user = useSettingsStore((state) => state.user);
  const language = useSettingsStore((state) => state.language);
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const signOut = useSettingsStore((state) => state.signOut);
  const scans = useScansStore((state) => state.scans);
  const clearScans = useScansStore((state) => state.clearScans);

  const close = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/history');
    }
  };

  const confirmDeleteAll = () => {
    confirmAction({
      title: t('profile.deleteHistoryTitle'),
      message: t('profile.deleteHistoryBody'),
      confirmLabel: t('profile.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
      onConfirm: clearScans,
    });
  };

  const confirmSignOut = () => {
    confirmAction({
      title: t('profile.signOutTitle'),
      message: t('profile.signOutBody'),
      confirmLabel: t('profile.signOut'),
      cancelLabel: t('common.cancel'),
      destructive: true,
      onConfirm: () => {
        signOut();
        router.replace('/welcome');
      },
    });
  };

  const languages: { key: Locale; label: string }[] = [
    { key: 'en', label: 'English' },
    { key: 'es', label: 'Español' },
  ];

  const appearances: { key: ThemeMode; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: 'system', label: t('profile.system'), icon: 'smartphone' },
    { key: 'dark', label: t('profile.dark'), icon: 'moon' },
    { key: 'light', label: t('profile.light'), icon: 'sun' },
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text variant="label" tone="muted">
            {t('profile.account')}
          </Text>
          <Text variant="title">{t('profile.title')}</Text>
        </View>
        <IconButton icon="x" accessibilityLabel={t('common.close')} onPress={close} />
      </View>

      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: colors.accent, borderColor: colors.accentBorder }]}>
          <Text variant="heading" style={{ color: colors.accentText }}>
            {initials(user?.name ?? t('profile.guest'))}
          </Text>
        </View>
        <View style={styles.profileText}>
          <Text variant="subheading">{user?.name ?? t('profile.guest')}</Text>
          <Text variant="caption" tone="secondary">
            {user?.email ?? '—'}
          </Text>
          <View style={styles.badges}>
            <Badge label={t('profile.demoAccount')} tone="accent" icon="shield" />
            <Badge label={t('profile.memberSince')} tone="neutral" />
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <SectionHeader title={t('profile.preferences')} />
        <Card padded={false}>
          <View style={styles.settingBlock}>
            <View style={styles.settingHeader}>
              <View style={styles.settingTitle}>
                <Feather name="globe" size={16} color={colors.textSecondary} />
                <Text variant="bodyStrong">{t('profile.language')}</Text>
              </View>
              <Text variant="caption" tone="muted">
                {language === 'en' ? 'EN' : 'ES'}
              </Text>
            </View>
            <Text variant="caption" tone="secondary">
              {t('profile.languageHint')}
            </Text>
            <View style={styles.languageRow}>
              {languages.map((item) => (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  onPress={() => setLanguage(item.key)}
                  style={[
                    styles.languageOption,
                    {
                      backgroundColor: language === item.key ? colors.accentSoft : colors.surfaceMuted,
                      borderColor: language === item.key ? colors.accentBorder : colors.border,
                    },
                  ]}>
                  <Text variant="bodyStrong" tone={language === item.key ? 'accent' : 'secondary'}>
                    {item.label}
                  </Text>
                  {language === item.key ? (
                    <Feather name="check" size={15} color={colors.accent} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>

          <Divider />

          <View style={styles.settingBlock}>
            <View style={styles.settingTitle}>
              <Feather name="layers" size={16} color={colors.textSecondary} />
              <Text variant="bodyStrong">{t('profile.appearance')}</Text>
            </View>
            <View style={styles.appearanceRow}>
              {appearances.map((item) => (
                <Chip
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  selected={themeMode === item.key}
                  onPress={() => setThemeMode(item.key)}
                />
              ))}
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title={t('profile.data')} />
        <Card padded={false}>
          <View style={styles.settingBlock}>
            <View style={styles.settingTitle}>
              <Feather name="database" size={16} color={colors.textSecondary} />
              <Text variant="bodyStrong">{t('profile.stats', { count: scans.length })}</Text>
            </View>
          </View>
          <Divider />
          <Pressable
            accessibilityRole="button"
            onPress={confirmDeleteAll}
            disabled={scans.length === 0}
            style={({ pressed }) => [
              styles.settingBlock,
              styles.deleteRow,
              { opacity: scans.length === 0 ? 0.4 : pressed ? 0.7 : 1 },
            ]}>
            <View style={styles.settingTitle}>
              <Feather name="trash-2" size={16} color={colors.danger} />
              <Text variant="bodyStrong" style={{ color: colors.danger }}>
                {t('profile.deleteHistory')}
              </Text>
            </View>
            <Feather name="chevron-right" size={17} color={colors.textMuted} />
          </Pressable>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title={t('profile.about')} />
        <Card padded={false}>
          <InfoRow
            label={t('profile.version')}
            value={Constants.expoConfig?.version ?? '1.1.0'}
          />
          <Divider />
          <InfoRow label={t('profile.build')} value="Meta Hackathon 2026" />
          <Divider />
          <InfoRow label={t('profile.aiModel')} value={t('profile.aiModelValue')} />
          <Divider />
          <View style={styles.settingBlock}>
            <View style={styles.settingTitle}>
              <Feather name="lock" size={16} color={colors.textSecondary} />
              <Text variant="bodyStrong">{t('profile.privacy')}</Text>
            </View>
            <Text variant="caption" tone="secondary" style={styles.privacyBody}>
              {t('profile.privacyBody')}
            </Text>
          </View>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button label={t('profile.signOut')} onPress={confirmSignOut} icon="log-out" variant="danger" />
        <Text variant="caption" tone="muted" style={styles.madeFor}>
          {t('profile.madeFor')}
        </Text>
      </View>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.infoRow}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <Text variant="caption" style={{ color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 18,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    flex: 1,
    gap: 3,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  section: {
    marginTop: 26,
  },
  settingBlock: {
    padding: 16,
    gap: 9,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  settingTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  languageOption: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appearanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  privacyBody: {
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  footer: {
    marginTop: 30,
    gap: 14,
  },
  madeFor: {
    textAlign: 'center',
  },
});
