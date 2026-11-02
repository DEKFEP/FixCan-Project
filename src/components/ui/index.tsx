import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  type TextInputProps,
  type TextProps as RNTextProps,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fontFamily, maxContentWidth, useAppTheme } from '@/theme';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'mono';

export type TextTone = 'primary' | 'secondary' | 'muted' | 'accent' | 'danger' | 'success' | 'inverse';

const textVariants: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fontFamily.displayBold, fontSize: 40, lineHeight: 44, letterSpacing: -1.4 },
  title: { fontFamily: fontFamily.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.8 },
  heading: { fontFamily: fontFamily.display, fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  subheading: { fontFamily: fontFamily.semibold, fontSize: 17, lineHeight: 23 },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: fontFamily.body, fontSize: 12, lineHeight: 17 },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  mono: { fontFamily: fontFamily.mono, fontSize: 13, lineHeight: 19 },
};

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export function Text({ variant = 'body', tone = 'primary', style, ...props }: TextProps) {
  const { colors } = useAppTheme();
  const toneColors: Record<TextTone, string> = {
    primary: colors.text,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    accent: colors.accent,
    danger: colors.danger,
    success: colors.success,
    inverse: colors.accentText,
  };

  return <RNText style={[textVariants[variant], { color: toneColors[tone] }, style]} {...props} />;
}

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps,
}: ScreenProps) {
  const { colors } = useAppTheme();
  const horizontal = padded ? 20 : 0;

  if (!scroll) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.flex, { backgroundColor: colors.background }, style]}>
        <View style={[styles.inner, { paddingHorizontal: horizontal }, contentContainerStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.flex, { backgroundColor: colors.background }, style]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontal }, contentContainerStyle]}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  tone?: 'default' | 'plain' | 'accent' | 'danger' | 'warning' | 'success' | 'info';
}

export function Card({ children, onPress, style, padded = true, tone = 'default' }: CardProps) {
  const { colors } = useAppTheme();

  const tones = {
    default: { backgroundColor: colors.surface, borderColor: colors.border },
    plain: { backgroundColor: 'transparent', borderColor: colors.border },
    accent: { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder },
    danger: { backgroundColor: colors.dangerSoft, borderColor: `${colors.danger}66` },
    warning: { backgroundColor: colors.warningSoft, borderColor: `${colors.warning}66` },
    success: { backgroundColor: colors.successSoft, borderColor: `${colors.success}66` },
    info: { backgroundColor: colors.infoSoft, borderColor: `${colors.info}66` },
  }[tone];

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        tones,
        padded && styles.cardPadded,
        pressed && onPress ? styles.pressed : null,
        style,
      ]}>
      {children}
    </Pressable>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const { colors } = useAppTheme();

  const variants: Record<ButtonVariant, { background: string; border: string; text: string }> = {
    primary: { background: colors.accent, border: colors.accent, text: colors.accentText },
    secondary: { background: colors.surfaceElevated, border: colors.border, text: colors.text },
    ghost: { background: 'transparent', border: 'transparent', text: colors.textSecondary },
    danger: { background: colors.dangerSoft, border: `${colors.danger}66`, text: colors.danger },
  };
  const palette = variants[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          opacity: isDisabled ? 0.55 : pressed ? 0.82 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={17} color={palette.text} /> : null}
          <Text variant="bodyStrong" style={{ color: palette.text }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Feather.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected = false, onPress, icon, style }: ChipProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.accentSoft : colors.surface,
          borderColor: selected ? colors.accentBorder : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}>
      {icon ? (
        <Feather name={icon} size={13} color={selected ? colors.accent : colors.textSecondary} />
      ) : null}
      <Text variant="caption" tone={selected ? 'accent' : 'secondary'} style={styles.chipText}>
        {label}
      </Text>
    </Pressable>
  );
}

interface IconButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  background?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  color,
  background,
  size = 20,
  style,
  disabled = false,
}: IconButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: background ?? colors.surfaceElevated,
          borderColor: colors.border,
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        },
        style,
      ]}>
      <Feather name={icon} size={size} color={color ?? colors.text} />
    </Pressable>
  );
}

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'orange';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Feather.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, tone = 'neutral', icon, style }: BadgeProps) {
  const { colors } = useAppTheme();
  const tones: Record<BadgeTone, { background: string; color: string; border: string }> = {
    neutral: { background: colors.surfaceMuted, color: colors.textSecondary, border: colors.border },
    accent: { background: colors.accentSoft, color: colors.accent, border: colors.accentBorder },
    success: { background: colors.successSoft, color: colors.success, border: `${colors.success}55` },
    warning: { background: colors.warningSoft, color: colors.warning, border: `${colors.warning}55` },
    danger: { background: colors.dangerSoft, color: colors.danger, border: `${colors.danger}55` },
    info: { background: colors.infoSoft, color: colors.info, border: `${colors.info}55` },
    orange: { background: colors.orangeSoft, color: colors.orange, border: `${colors.orange}55` },
  };
  const palette = tones[tone];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.background, borderColor: palette.border },
        style,
      ]}>
      {icon ? <Feather name={icon} size={11} color={palette.color} /> : null}
      <Text variant="label" style={[styles.badgeText, { color: palette.color }]}>
        {label}
      </Text>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({ title, right, style }: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text variant="label" tone="muted">
        {title}
      </Text>
      {right}
    </View>
  );
}

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({ icon, title, body, actionLabel, onAction, style }: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.emptyState, style]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
        <Feather name={icon} size={26} color={colors.accent} />
      </View>
      <Text variant="heading" style={styles.centerText}>
        {title}
      </Text>
      <Text tone="secondary" style={[styles.centerText, styles.emptyBody]}>
        {body}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} style={styles.emptyAction} />
      ) : null}
    </View>
  );
}

interface InputProps extends TextInputProps {
  icon?: keyof typeof Feather.glyphMap;
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({ icon, onClear, containerStyle, style, ...props }: InputProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.inputContainer,
        { backgroundColor: colors.input, borderColor: colors.border },
        containerStyle,
      ]}>
      {icon ? <Feather name={icon} size={17} color={colors.textMuted} /> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        style={[styles.input, { color: colors.text }, style]}
        {...props}
      />
      {onClear && props.value ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear" onPress={onClear} hitSlop={8}>
          <Feather name="x-circle" size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }, style]} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingBottom: 40,
  },
  inner: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    flexGrow: 1,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPadded: {
    padding: 18,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }],
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  chip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chipText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  centerText: {
    textAlign: 'center',
  },
  emptyBody: {
    marginTop: 8,
    maxWidth: 300,
  },
  emptyAction: {
    marginTop: 22,
  },
  inputContainer: {
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 15,
    paddingVertical: 12,
  },
});
