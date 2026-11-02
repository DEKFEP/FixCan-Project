import i18n from '@/i18n';
import type { Locale, RepairPlan } from '@/types/scan';

export function formatCost(cost: RepairPlan['estimatedCost'], locale: Locale): string {
  if (!cost) {
    return '—';
  }
  if (cost.min === 0 && cost.max === 0) {
    return i18n.t('detail.free');
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cost.currency,
    maximumFractionDigits: 0,
  });

  if (cost.min === cost.max) {
    return formatter.format(cost.min);
  }

  return `${formatter.format(cost.min)}–${formatter.format(cost.max)}`;
}

export function confidenceLabel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.85) {
    return 'high';
  }
  if (confidence >= 0.6) {
    return 'medium';
  }
  return 'low';
}
