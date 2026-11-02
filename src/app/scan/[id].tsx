import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanArtwork } from '@/components/scan-artwork';
import { SeverityBadge } from '@/components/severity-badge';
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  IconButton,
  Screen,
  SectionHeader,
  Text,
} from '@/components/ui';
import { formatScanDate } from '@/lib/date';
import { confidenceLabel, formatCost } from '@/lib/format';
import { confirmAction } from '@/lib/confirm';
import { useAssistantStore } from '@/store/assistant';
import { useScansStore } from '@/store/scans';
import { useAppTheme } from '@/theme';
import type { Difficulty, Repairability } from '@/types/scan';

export default function ScanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scan = useScansStore((state) => state.scans.find((item) => item.id === id));
  const removeScan = useScansStore((state) => state.removeScan);
  const setActiveScanId = useAssistantStore((state) => state.setActiveScanId);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/history');
    }
  };

  if (!scan) {
    return (
      <Screen>
        <View style={styles.missingHeader}>
          <IconButton icon="arrow-left" accessibilityLabel={t('common.back')} onPress={goBack} />
        </View>
        <EmptyState
          icon="file-minus"
          title={t('detail.notFound')}
          body={t('detail.notFoundBody')}
          actionLabel={t('common.back')}
          onAction={goBack}
        />
      </Screen>
    );
  }

  const confidence = confidenceLabel(scan.component.confidence);
  const confidenceTone = confidence === 'high' ? 'success' : confidence === 'medium' ? 'warning' : 'danger';
  const confidenceKey =
    confidence === 'high'
      ? 'detail.confidenceHigh'
      : confidence === 'medium'
        ? 'detail.confidenceMedium'
        : 'detail.confidenceLow';
  const hasDamage = scan.damage.detected;
  const repairability = t(`repairability.${scan.repair.repairability as Repairability}`);
  const difficulty = t(`difficulty.${scan.repair.difficulty as Difficulty}`);
  const cost = formatCost(scan.repair.estimatedCost, scan.locale);

  const confirmDelete = () => {
    confirmAction({
      title: t('detail.deleteTitle'),
      message: t('detail.deleteBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
      onConfirm: () => {
        removeScan(scan.id);
        goBack();
      },
    });
  };

  const askAssistant = () => {
    setActiveScanId(scan.id);
    router.navigate('/assistant');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 128 + insets.bottom }]}>
        <View style={styles.hero}>
          <ScanArtwork
            category={scan.component.category}
            imageUri={scan.imageUri}
            height={392}
            showLabel={false}
          />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.heroFade}
            pointerEvents="none"
          />
          <SafeAreaView edges={['top']} style={styles.heroHeader}>
            <IconButton
              icon="arrow-left"
              accessibilityLabel={t('common.back')}
              onPress={goBack}
              background="rgba(8, 10, 11, 0.62)"
              color="#FFFFFF"
              style={styles.heroIcon}
            />
            <View style={styles.heroHeaderRight}>
              <IconButton
                icon="trash-2"
                accessibilityLabel={t('common.delete')}
                onPress={confirmDelete}
                background="rgba(8, 10, 11, 0.62)"
                color="#FFFFFF"
                style={styles.heroIcon}
              />
            </View>
          </SafeAreaView>

          <View style={styles.heroBadges}>
            <Badge label={t(`categories.${scan.component.category}`)} tone="accent" icon="tag" />
            <Badge
              label={`${Math.round(scan.component.confidence * 100)}% · ${t(confidenceKey)}`}
              tone={confidenceTone}
              icon="target"
            />
            {scan.isDemo ? <Badge label={t('common.demo')} tone="neutral" /> : null}
          </View>
        </View>

        <View style={styles.body}>
          <View>
            <Text variant="title" style={styles.name}>
              {scan.component.name}
            </Text>
            <Text variant="subheading" tone="secondary" style={styles.brand}>
              {scan.component.brand} · {scan.component.model}
            </Text>
            <Text variant="caption" tone="muted" style={styles.date}>
              {formatScanDate(scan.createdAt, i18n.language)}
            </Text>
          </View>

          <Text tone="secondary" style={styles.description}>
            {scan.component.description}
          </Text>

          <View style={styles.section}>
            <SectionHeader title={t('detail.specs')} />
            <Card padded={false}>
              {scan.component.specs.map((spec, index) => (
                <View
                  key={`${spec.label}-${index}`}
                  style={[
                    styles.specRow,
                    index < scan.component.specs.length - 1 && {
                      borderBottomColor: colors.border,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                  ]}>
                  <Text variant="caption" tone="secondary">
                    {spec.label}
                  </Text>
                  <Text variant="bodyStrong" style={styles.specValue}>
                    {spec.value}
                  </Text>
                </View>
              ))}
              {scan.component.identifiers?.partNumber ? (
                <View style={[styles.specRow, { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <Text variant="caption" tone="secondary">
                    {t('detail.partNumber')}
                  </Text>
                  <Text variant="mono" style={styles.specValue}>
                    {scan.component.identifiers.partNumber}
                  </Text>
                </View>
              ) : null}
              {scan.component.identifiers?.serial ? (
                <View style={[styles.specRow, { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <Text variant="caption" tone="secondary">
                    {t('detail.serial')}
                  </Text>
                  <Text variant="mono" style={styles.specValue}>
                    {scan.component.identifiers.serial}
                  </Text>
                </View>
              ) : null}
            </Card>
          </View>

          <View style={styles.section}>
            <SectionHeader title={t('detail.damage')} />
            <Card tone={hasDamage ? 'danger' : 'success'}>
              <View style={styles.damageHeader}>
                <View style={styles.damageTitleRow}>
                  <Feather
                    name={hasDamage ? 'alert-triangle' : 'check-circle'}
                    size={18}
                    color={hasDamage ? colors.danger : colors.success}
                  />
                  <Text variant="subheading" style={{ color: hasDamage ? colors.danger : colors.success }}>
                    {hasDamage ? t('detail.damageDetected') : t('detail.noDamage')}
                  </Text>
                </View>
                <SeverityBadge severity={scan.damage.severity} />
              </View>

              <Text tone="secondary" style={styles.damageSummary}>
                {hasDamage ? scan.damage.summary : t('detail.noDamageBody')}
              </Text>

              {scan.damage.findings.length > 0 ? (
                <View style={styles.findings}>
                  <Divider />
                  <Text variant="label" tone="muted" style={styles.findingsTitle}>
                    {t('detail.findings')}
                  </Text>
                  {scan.damage.findings.map((finding, index) => (
                    <View key={`${finding.type}-${index}`} style={styles.finding}>
                      <View style={[styles.findingDot, { backgroundColor: colors.danger }]} />
                      <View style={styles.findingContent}>
                        <View style={styles.findingTop}>
                          <Text variant="bodyStrong">{t(`damageType.${finding.type}`)}</Text>
                          <Text variant="caption" tone="muted">
                            {Math.round(finding.confidence * 100)}%
                          </Text>
                        </View>
                        <Text variant="caption" tone="secondary">
                          {finding.description}
                        </Text>
                        {finding.location ? (
                          <View style={styles.location}>
                            <Feather name="map-pin" size={10} color={colors.textMuted} />
                            <Text variant="caption" tone="muted">
                              {finding.location}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          </View>

          <View style={styles.section}>
            <SectionHeader title={hasDamage ? t('detail.repair') : t('detail.maintenance')} />
            <View style={styles.metaGrid}>
              <MetaCell label={t('detail.repairability')} value={repairability} colors={colors} />
              <MetaCell label={t('detail.difficulty')} value={difficulty} colors={colors} />
              <MetaCell label={t('detail.time')} value={scan.repair.estimatedTime ?? '—'} colors={colors} />
              <MetaCell label={t('detail.cost')} value={cost} colors={colors} accent />
            </View>

            <View style={styles.subSection}>
              <Text variant="label" tone="muted">
                {t('detail.tools')}
              </Text>
              <View style={styles.tools}>
                {scan.repair.tools.length > 0 ? (
                  scan.repair.tools.map((tool) => (
                    <View
                      key={tool}
                      style={[styles.tool, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Feather name="tool" size={11} color={colors.textSecondary} />
                      <Text variant="caption" tone="secondary">
                        {tool}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text variant="caption" tone="muted">
                    {t('detail.noTools')}
                  </Text>
                )}
              </View>
            </View>

            {scan.repair.steps.length > 0 ? (
              <View style={styles.subSection}>
                <Text variant="label" tone="muted">
                  {t('detail.steps')}
                </Text>
                <View style={styles.steps}>
                  {scan.repair.steps.map((step, index) => (
                    <View key={`${step.title}-${index}`} style={styles.step}>
                      <View style={[styles.stepNumber, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}>
                        <Text variant="caption" tone="accent" style={styles.stepNumberText}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.stepContent}>
                        <Text variant="bodyStrong">{step.title}</Text>
                        <Text variant="caption" tone="secondary" style={styles.stepDetail}>
                          {step.detail}
                        </Text>
                        {step.safety ? (
                          <View style={styles.stepSafety}>
                            <Feather name="shield" size={11} color={colors.warning} />
                            <Text variant="caption" style={{ color: colors.warning, flex: 1 }}>
                              {step.safety}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {scan.repair.warnings.length > 0 ? (
              <View style={styles.subSection}>
                <Text variant="label" tone="muted">
                  {t('detail.safety')}
                </Text>
                <Card tone="warning">
                  <View style={styles.warningList}>
                    {scan.repair.warnings.map((warning) => (
                      <View key={warning} style={styles.warningRow}>
                        <Feather name="alert-triangle" size={12} color={colors.warning} />
                        <Text variant="caption" style={{ color: colors.warning, flex: 1 }}>
                          {warning}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </View>
            ) : null}

            {scan.repair.whenToSeekPro.length > 0 ? (
              <View style={styles.subSection}>
                <Text variant="label" tone="muted">
                  {t('detail.whenToSeekPro')}
                </Text>
                <Card tone="plain">
                  <View style={styles.warningList}>
                    {scan.repair.whenToSeekPro.map((item) => (
                      <View key={item} style={styles.warningRow}>
                        <Feather name="user-check" size={12} color={colors.textSecondary} />
                        <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </View>
            ) : null}
          </View>

          <Text variant="caption" tone="muted" style={styles.disclaimer}>
            {t('detail.disclaimer')}
          </Text>
          <Text variant="mono" tone="muted" style={styles.model}>
            {scan.model}
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 10,
          },
        ]}>
        <Button label={t('detail.askAssistant')} icon="message-circle" onPress={askAssistant} />
      </View>
    </View>
  );
}

function MetaCell({
  label,
  value,
  colors,
  accent = false,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
  accent?: boolean;
}) {
  return (
    <View style={[styles.metaCell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <Text variant="bodyStrong" style={accent ? { color: colors.accent } : undefined}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  hero: {
    height: 392,
    justifyContent: 'flex-end',
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  heroHeaderRight: {
    flexDirection: 'row',
    gap: 8,
  },
  heroIcon: {
    borderColor: 'rgba(255,255,255,0.14)',
  },
  heroBadges: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 6,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  name: {
    fontSize: 32,
    lineHeight: 37,
  },
  brand: {
    marginTop: 4,
  },
  date: {
    marginTop: 7,
  },
  description: {
    marginTop: 16,
    lineHeight: 23,
  },
  section: {
    marginTop: 30,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  specValue: {
    flex: 1,
    textAlign: 'right',
  },
  damageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  damageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  damageSummary: {
    marginTop: 12,
  },
  findings: {
    marginTop: 16,
    gap: 12,
  },
  findingsTitle: {
    marginTop: 14,
  },
  finding: {
    flexDirection: 'row',
    gap: 10,
  },
  findingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  findingContent: {
    flex: 1,
    gap: 3,
  },
  findingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaCell: {
    flexGrow: 1,
    flexBasis: '48%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    gap: 4,
  },
  subSection: {
    marginTop: 20,
    gap: 10,
  },
  tools: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  steps: {
    gap: 18,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepDetail: {
    lineHeight: 19,
  },
  stepSafety: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
    paddingTop: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 198, 92, 0.3)',
  },
  warningList: {
    gap: 10,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  disclaimer: {
    marginTop: 30,
    textAlign: 'center',
  },
  model: {
    marginTop: 5,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  missingHeader: {
    paddingTop: 8,
    marginBottom: 24,
  },
});
