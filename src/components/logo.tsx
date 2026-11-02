import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { useAppTheme } from '@/theme';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({ size = 40, showText = true }: LogoProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.mark,
          {
            width: size,
            height: size,
            borderRadius: size * 0.3,
            backgroundColor: colors.accent,
          },
        ]}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            fontSize: size * 0.52,
            lineHeight: size * 0.62,
            color: colors.accentText,
          }}>
          F
        </Text>
        <View style={[styles.corner, styles.cornerTop, { borderColor: colors.accentText }]} />
        <View style={[styles.corner, styles.cornerBottom, { borderColor: colors.accentText }]} />
      </View>
      {showText ? (
        <Text variant="heading" style={styles.wordmark}>
          FixCan
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wordmark: {
    letterSpacing: -0.7,
  },
  corner: {
    position: 'absolute',
    width: 8,
    height: 8,
  },
  cornerTop: {
    top: 5,
    right: 5,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
  },
  cornerBottom: {
    bottom: 5,
    left: 5,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
  },
});
