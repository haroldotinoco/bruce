/**
 * Backend / Temporal payloads may carry legacy icon ids that are not valid
 * Lucide `lucide-icon` names. Map them here so older runs still render.
 */
const LEGACY_STEP_ICONS: Record<string, string> = {
  document: 'file-text',
  chart: 'bar-chart-3',
  cube: 'hammer',
};

export function normalizeLucideStepIcon(name: string | null | undefined): string {
  if (name == null || name === '') return 'circle';
  const key = name.trim().toLowerCase();
  return LEGACY_STEP_ICONS[key] ?? key;
}
