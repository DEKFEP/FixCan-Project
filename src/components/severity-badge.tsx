import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui';
import type { Severity } from '@/types/scan';

const toneMap = {
  none: 'success',
  minor: 'warning',
  moderate: 'orange',
  severe: 'danger',
} as const;

const iconMap = {
  none: 'check-circle',
  minor: 'info',
  moderate: 'alert-triangle',
  severe: 'alert-octagon',
} as const;

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { t } = useTranslation();

  return (
    <Badge
      label={t(`severity.${severity}`)}
      tone={toneMap[severity]}
      icon={iconMap[severity]}
    />
  );
}
