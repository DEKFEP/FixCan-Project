import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { useAppTheme } from '@/theme';
import type { ScanCategory } from '@/types/scan';

const icons: Record<ScanCategory, keyof typeof Feather.glyphMap> = {
  gpu: 'cpu',
  cpu: 'cpu',
  ram: 'server',
  storage: 'hard-drive',
  psu: 'zap',
  motherboard: 'grid',
  cooling: 'wind',
  battery: 'battery-charging',
  phone_part: 'smartphone',
  laptop_part: 'monitor',
  other: 'box',
};

interface ScanArtworkProps {
  category: ScanCategory;
  imageUri?: string;
  height?: number;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ScanArtwork({
  category,
  imageUri,
  height = 300,
  showLabel = true,
  style,
}: ScanArtworkProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showImage = Boolean(imageUri) && failedUri !== imageUri;
  const compact = height < 60;
  const iconSize = compact
    ? Math.max(14, height * 0.42)
    : Math.max(26, Math.min(58, height * 0.3));
  const frameSize = Math.max(64, Math.min(130, height * 0.34));
  const cornerSize = Math.max(7, Math.min(14, frameSize * 0.19));
  const gradient = isDark
    ? (['#1B2326', '#0B0E10'] as const)
    : (['#E8EDE2', '#D4DCCB'] as const);

  return (
    <View style={[{ height, backgroundColor: colors.surfaceMuted }, styles.container, style]}>
      {showImage ? (
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={180}
          onError={() => setFailedUri(imageUri ?? null)}
        />
      ) : (
        <>
          <LinearGradient colors={gradient} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={[styles.grid, styles.gridHorizontal]}>
            {Array.from({ length: 7 }).map((_, index) => (
              <View
                key={`h-${index}`}
                style={[styles.gridLineHorizontal, { backgroundColor: colors.border, opacity: 0.5 }]}
              />
            ))}
          </View>
          <View style={[styles.grid, styles.gridVertical]}>
            {Array.from({ length: 7 }).map((_, index) => (
              <View
                key={`v-${index}`}
                style={[styles.gridLineVertical, { backgroundColor: colors.border, opacity: 0.5 }]}
              />
            ))}
          </View>
          {compact ? (
            <Feather name={icons[category]} size={iconSize} color={colors.accent} />
          ) : (
            <>
              <View
                style={[
                  styles.glow,
                  {
                    width: height * 0.72,
                    height: height * 0.72,
                    borderRadius: height * 0.36,
                    backgroundColor: colors.accentSoft,
                  },
                ]}
              />
              <View
                style={[
                  styles.iconFrame,
                  {
                    width: frameSize,
                    height: frameSize,
                    borderRadius: frameSize * 0.24,
                    borderColor: colors.accentBorder,
                    backgroundColor: isDark ? 'rgba(8, 10, 11, 0.38)' : 'rgba(255, 255, 255, 0.42)',
                  },
                ]}>
                <View
                  style={[
                    styles.corner,
                    styles.cornerTopLeft,
                    { width: cornerSize, height: cornerSize, borderColor: colors.accent },
                  ]}
                />
                <View
                  style={[
                    styles.corner,
                    styles.cornerTopRight,
                    { width: cornerSize, height: cornerSize, borderColor: colors.accent },
                  ]}
                />
                <View
                  style={[
                    styles.corner,
                    styles.cornerBottomLeft,
                    { width: cornerSize, height: cornerSize, borderColor: colors.accent },
                  ]}
                />
                <View
                  style={[
                    styles.corner,
                    styles.cornerBottomRight,
                    { width: cornerSize, height: cornerSize, borderColor: colors.accent },
                  ]}
                />
                <Feather name={icons[category]} size={iconSize} color={colors.accent} />
              </View>
            </>
          )}
        </>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.42)']}
        style={styles.fade}
        pointerEvents="none"
      />

      {showLabel ? (
        <View style={[styles.label, { backgroundColor: 'rgba(8, 10, 11, 0.62)', borderColor: 'rgba(255,255,255,0.14)' }]}>
          <Feather name={icons[category]} size={11} color={colors.accent} />
          <Text variant="label" style={styles.labelText}>
            {t(`categories.${category}`)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  gridHorizontal: {
    flexDirection: 'column',
  },
  gridVertical: {
    flexDirection: 'row',
  },
  gridLineHorizontal: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  gridLineVertical: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
  },
  glow: {
    position: 'absolute',
  },
  iconFrame: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    opacity: 0.9,
  },
  cornerTopLeft: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTopRight: {
    top: 8,
    right: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBottomLeft: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBottomRight: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '35%',
  },
  label: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 9,
  },
});
