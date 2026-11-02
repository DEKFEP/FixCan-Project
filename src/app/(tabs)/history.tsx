import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Logo } from '@/components/logo';
import { ScanCard } from '@/components/scan-card';
import { Chip, EmptyState, Input, Screen, SectionHeader, Text } from '@/components/ui';
import type { DateGroup } from '@/lib/date';
import { getDateGroup, initials } from '@/lib/date';
import { useScansStore } from '@/store/scans';
import { useSettingsStore } from '@/store/settings';
import { useAppTheme } from '@/theme';

type Filter = 'all' | 'damaged' | 'healthy';

const groupOrder: DateGroup[] = ['today', 'yesterday', 'earlier'];

export default function HistoryScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const scans = useScansStore((state) => state.scans);
  const user = useSettingsStore((state) => state.user);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...scans]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .filter((scan) => {
        if (filter === 'damaged' && !scan.damage.detected) {
          return false;
        }
        if (filter === 'healthy' && scan.damage.detected) {
          return false;
        }
        if (!term) {
          return true;
        }
        return [scan.component.name, scan.component.brand, scan.component.model, scan.component.category]
          .join(' ')
          .toLowerCase()
          .includes(term);
      });
  }, [filter, query, scans]);

  const attention = scans.filter((scan) => scan.damage.detected).length;

  const groups = useMemo(
    () =>
      groupOrder
        .map((key) => ({
          key,
          data: filtered.filter((scan) => getDateGroup(scan.createdAt) === key),
        }))
        .filter((group) => group.data.length > 0),
    [filtered],
  );

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('history.filterAll') },
    { key: 'damaged', label: t('history.filterDamaged') },
    { key: 'healthy', label: t('history.filterHealthy') },
  ];

  const openScan = (id: string) => {
    router.push(`/scan/${id}`);
  };

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <Logo size={36} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('profile.title')}
          onPress={() => router.push('/profile')}
          style={({ pressed }) => [
            styles.avatar,
            {
              backgroundColor: colors.accentSoft,
              borderColor: colors.accentBorder,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <Text variant="bodyStrong" tone="accent">
            {initials(user?.name ?? t('profile.guest'))}
          </Text>
        </Pressable>
      </View>

      <View style={styles.heading}>
        <Text variant="label" tone="muted">
          {t('history.eyebrow')}
        </Text>
        <Text variant="title" style={styles.title}>
          {t('history.title')}
        </Text>
        <Text tone="secondary">{t('history.subtitle')}</Text>
      </View>

      <View style={styles.stats}>
        <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Feather name="layers" size={14} color={colors.accent} />
          <Text variant="caption" tone="secondary">
            {scans.length} {t('common.scans')}
          </Text>
        </View>
        {attention > 0 ? (
          <View style={[styles.stat, { backgroundColor: colors.warningSoft, borderColor: `${colors.warning}55` }]}>
            <Feather name="alert-triangle" size={14} color={colors.warning} />
            <Text variant="caption" style={{ color: colors.warning }}>
              {attention} {t('history.needAttention')}
            </Text>
          </View>
        ) : null}
      </View>

      <Input
        icon="search"
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        placeholder={t('history.searchPlaceholder')}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        containerStyle={styles.search}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filterScroll}>
        {filters.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={filter === item.key}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </ScrollView>

      {scans.length === 0 ? (
        <EmptyState
          icon="camera"
          title={t('history.emptyTitle')}
          body={t('history.emptyBody')}
          actionLabel={t('history.emptyCta')}
          onAction={() => router.navigate('/scan')}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title={t('history.noResults')}
          body={t('history.noResultsBody')}
        />
      ) : (
        groups.map((group) => (
          <View key={group.key} style={styles.group}>
            <SectionHeader
              title={t(`common.${group.key}`)}
              right={
                <Text variant="caption" tone="muted">
                  {group.data.length}
                </Text>
              }
            />
            <View style={styles.list}>
              {group.data.map((scan) => (
                <ScanCard key={scan.id} scan={scan} onPress={() => openScan(scan.id)} />
              ))}
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginTop: 26,
    gap: 5,
  },
  title: {
    marginTop: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  search: {
    marginTop: 20,
  },
  filters: {
    gap: 8,
    paddingVertical: 14,
  },
  filterScroll: {
    marginBottom: 4,
  },
  group: {
    marginTop: 20,
  },
  list: {
    gap: 10,
  },
});
