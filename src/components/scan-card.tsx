import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ScanArtwork } from '@/components/scan-artwork';
import { SeverityBadge } from '@/components/severity-badge';
import { Text } from '@/components/ui';
import { formatScanDate } from '@/lib/date';
import { useAppTheme } from '@/theme';
import type { Scan } from '@/types/scan';

interface ScanCardProps {
  scan: Scan;
  onPress: () => void;
}

export function ScanCard({ scan, onPress }: ScanCardProps) {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${scan.component.name}, ${t(`severity.${scan.damage.severity}`)}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <ScanArtwork
        category={scan.component.category}
        imageUri={scan.imageUri}
        height={104}
        showLabel={false}
        style={styles.artwork}
      />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text variant="subheading" numberOfLines={1} style={styles.title}>
            {scan.component.name}
          </Text>
          <Feather name="chevron-right" size={17} color={colors.textMuted} />
        </View>
        <Text variant="caption" tone="secondary" numberOfLines={1}>
          {scan.component.brand} · {scan.component.model}
        </Text>
        <View style={styles.bottomRow}>
          <SeverityBadge severity={scan.damage.severity} />
          <Text variant="caption" tone="muted" numberOfLines={1} style={styles.date}>
            {formatScanDate(scan.createdAt, i18n.language)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 104,
  },
  artwork: {
    width: 104,
  },
  content: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  date: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
