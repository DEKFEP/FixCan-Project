import { Image, StyleSheet, View } from 'react-native';

import logoMark from '@/assets/images/logo-mark.png';
import { Text } from '@/components/ui';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({ size = 40, showText = true }: LogoProps) {
  return (
    <View style={styles.row}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={logoMark}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
        }}
      />
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
  wordmark: {
    letterSpacing: -0.7,
  },
});
