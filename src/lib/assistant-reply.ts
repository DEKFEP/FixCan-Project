import i18n from '@/i18n';
import { formatCost } from '@/lib/format';
import type { Locale, Scan } from '@/types/scan';

const t = (key: string, options?: Record<string, unknown>) => String(i18n.t(key, options));

const includesAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

const bullets = (items: string[]) => items.map((item) => `• ${item}`).join('\n');

export function buildAssistantReply(scan: Scan, prompt: string): string {
  const text = prompt.toLowerCase();
  const locale: Locale = i18n.language === 'es' ? 'es' : 'en';
  const severity = t(`severity.${scan.damage.severity}`);
  const difficulty = t(`difficulty.${scan.repair.difficulty}`);
  const repairability = t(`repairability.${scan.repair.repairability}`);
  const cost = formatCost(scan.repair.estimatedCost, locale);
  const time = scan.repair.estimatedTime ?? '—';
  const firstStep = scan.repair.steps[0]?.title ?? t('detail.noDamageBody');
  const pro = scan.repair.whenToSeekPro[0] ?? t('assistant.replyProFallback');
  const tools = scan.repair.tools.length > 0 ? bullets(scan.repair.tools) : t('detail.noTools');
  const warnings =
    scan.repair.warnings.length > 0 ? bullets(scan.repair.warnings) : t('detail.noDamageBody');

  if (includesAny(text, ['safe', 'safety', 'warn', 'danger', 'risk', 'hurt', 'shock', 'segur', 'peligro', 'riesgo', 'cuidado'])) {
    return t('assistant.replySafety', { warnings, pro });
  }

  if (includesAny(text, ['tool', 'screwdriver', 'herramient', 'destornill'])) {
    return t('assistant.replyTools', { tools, firstStep });
  }

  if (includesAny(text, ['part', 'piece', 'replacement', 'repuesto', 'pieza', 'reemplaz'])) {
    return t('assistant.replyCost', {
      category: t(`categories.${scan.component.category}`),
      brand: scan.component.brand,
      model: scan.component.model,
      cost,
    });
  }

  if (includesAny(text, ['cost', 'price', 'much', 'precio', 'costar', 'cuánto', 'cuanto', 'budget'])) {
    return t('assistant.replyCost', {
      category: t(`categories.${scan.component.category}`),
      brand: scan.component.brand,
      model: scan.component.model,
      cost,
    });
  }

  if (includesAny(text, ['worth', 'repair', 'fix', 'vale', 'reparar', 'arreglar', 'convenir'])) {
    if (scan.repair.repairability === 'yes') {
      return t('assistant.replyWorthYes', { severity, difficulty, time, cost, firstStep });
    }
    if (scan.repair.repairability === 'partial') {
      return t('assistant.replyWorthPartial', { severity, difficulty, pro, cost });
    }
    if (scan.repair.repairability === 'no') {
      return t('assistant.replyWorthNo', { severity, pro });
    }
    return t('assistant.replyWorthNotNeeded');
  }

  return t('assistant.replyDefault', {
    summary: scan.damage.detected ? scan.damage.summary : t('detail.noDamageBody'),
    severity,
    repairability,
  });
}
