import i18n from '@/i18n';

export type DateGroup = 'today' | 'yesterday' | 'earlier';

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();

export function getDateGroup(iso: string): DateGroup {
  const date = new Date(iso);
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const day = 24 * 60 * 60 * 1000;

  if (target === today) {
    return 'today';
  }
  if (target === today - day) {
    return 'yesterday';
  }
  return 'earlier';
}

export function formatScanDate(iso: string, locale: string): string {
  const date = new Date(iso);
  const group = getDateGroup(iso);
  const time = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  if (group === 'today') {
    return `${i18n.t('common.today')} · ${time}`;
  }
  if (group === 'yesterday') {
    return `${i18n.t('common.yesterday')} · ${time}`;
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  }).format(date);
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
